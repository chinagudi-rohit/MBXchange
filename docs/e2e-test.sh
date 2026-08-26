#!/usr/bin/env bash
# End-to-end functional test across the three roles.
#
# Exercises the real HTTP API against a freshly seeded database: an employee
# posting and applying, the two-stage approval, the manager and admin views,
# and every authorisation boundary in between. Prints PASS/FAIL per check and
# exits non-zero if anything failed.
set -uo pipefail
API=${API:-http://localhost:8787/api}
PASS=0; FAIL=0

tok() {
  curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$1\",\"password\":\"$2\"}" |
    python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("token",""))'
}
# check <label> <expected-substring> <actual>
check() {
  if printf '%s' "$3" | grep -qF -- "$2"; then
    printf '  \033[32mPASS\033[0m %s\n' "$1"; PASS=$((PASS+1))
  else
    printf '  \033[31mFAIL\033[0m %s\n       expected to contain: %s\n       got: %s\n' "$1" "$2" "${3:0:220}"
    FAIL=$((FAIL+1))
  fi
}
jqp() { python3 -c "import sys,json;d=json.load(sys.stdin);print($1)" 2>/dev/null; }

EMPLOYEE_PW='Mbx@2026'
ADMIN=$(tok "mbxchange.admin@mercedes-benz.com" 'MBXAdmin@2026')
# Karthik reports to Vikram; Ananya and Divya are Vikram's reports too.
POSTER=$(tok "arjun.mehta@mercedes-benz.com" "$EMPLOYEE_PW")       # posts the work
APPLICANT=$(tok "karthik.iyer@mercedes-benz.com" "$EMPLOYEE_PW")   # applies for it
MANAGER=$(tok "vikram.subramanian@mercedes-benz.com" "$EMPLOYEE_PW") # approves stage 2
OUTSIDER=$(tok "tarun.malviya@mercedes-benz.com" "$EMPLOYEE_PW")   # no standing

echo; echo "══ AUTH ══"
check "admin signs in"      "eyJ" "$ADMIN"
check "employee signs in"   "eyJ" "$APPLICANT"
check "bad password refused" "error" "$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' -d '{"email":"karthik.iyer@mercedes-benz.com","password":"wrong"}')"
check "no token refused"    "Authentication required" "$(curl -s $API/me)"

echo; echo "══ EMPLOYEE · posting a requirement ══"
POST_ID=$(curl -s -X POST $API/work-posts -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' \
  -d '{"title":"E2E automated check","description":"Created by the end-to-end test.","department":"PT-THIF","effortHours":"4 hours total","effortMin":4,"effortMax":4,"seats":1,"approvalRequired":true,"tags":["Terraform"]}' | jqp 'd.get("id") or d.get("post",{}).get("id","")')
check "post created" "wp_" "$POST_ID"
check "post missing title rejected" "required" "$(curl -s -X POST $API/work-posts -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' -d '{"description":"no title"}')"
check "post visible in feed" "E2E automated check" "$(curl -s $API/work-posts -H "Authorization: Bearer $APPLICANT")"

echo; echo "══ EMPLOYEE · applying ══"
APPLY=$(curl -s -X POST $API/work-posts/$POST_ID/apply -H "Authorization: Bearer $APPLICANT" -H 'Content-Type: application/json' -d '{"commitment":"4 hours","note":"e2e"}')
APP_ID=$(printf '%s' "$APPLY" | jqp 'd["results"][0]["applicationId"]')
check "application created pending_author" "pending_author" "$APPLY"
check "duplicate application refused" "error" "$(curl -s -X POST $API/work-posts/$POST_ID/apply -H "Authorization: Bearer $APPLICANT" -H 'Content-Type: application/json' -d '{"commitment":"4 hours"}')"
check "applicant sees it in My Requests" "$APP_ID" "$(curl -s $API/requests/mine -H "Authorization: Bearer $APPLICANT")"

echo; echo "══ APPROVAL STAGE 1 · requirement author ══"
check "author sees it in approvals" "$APP_ID" "$(curl -s $API/approvals -H "Authorization: Bearer $POSTER")"
check "outsider does NOT see it" "" "$(curl -s $API/approvals -H "Authorization: Bearer $OUTSIDER" | grep -c "$APP_ID" | grep '^0$')"
check "outsider cannot decide" "error" "$(curl -s -X POST $API/approvals/$APP_ID/decision -H "Authorization: Bearer $OUTSIDER" -H 'Content-Type: application/json' -d '{"decision":"approved"}')"
check "reject without reason refused" "reason" "$(curl -s -X POST $API/approvals/$APP_ID/decision -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' -d '{"decision":"rejected"}')"
check "author approves -> pending_manager" "pending_manager" "$(curl -s -X POST $API/approvals/$APP_ID/decision -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' -d '{"decision":"approved"}')"

echo; echo "══ APPROVAL STAGE 2 · line manager ══"
check "manager sees it" "$APP_ID" "$(curl -s $API/approvals -H "Authorization: Bearer $MANAGER")"
check "manager approves -> approved" '"status":"approved"' "$(curl -s -X POST $API/approvals/$APP_ID/decision -H "Authorization: Bearer $MANAGER" -H 'Content-Type: application/json' -d '{"decision":"approved"}')"
check "seats full -> In Progress" "In Progress" "$(curl -s $API/work-posts -H "Authorization: Bearer $POSTER" | python3 -c "
import sys,json
for p in json.load(sys.stdin)['posts']:
    if p['id']=='$POST_ID': print(p['status'])")"

echo; echo "══ RECOGNITION ══"
curl -s -X PATCH $API/work-posts/$POST_ID -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' -d '{"status":"Completed"}' >/dev/null
# Build JSON with python so shell quoting cannot mangle it.
award_json() { python3 -c "import json,sys; print(json.dumps({'applicationId':sys.argv[1],'badgeId':sys.argv[2]}))" "$1" "$2"; }
check "badge awarded by the author" "appreciation" "$(curl -s -X POST $API/appreciations -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' -d "$(award_json "$APP_ID" team_player)")"
check "same giver cannot award twice" "already recognised" "$(curl -s -X POST $API/appreciations -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' -d "$(award_json "$APP_ID" unblocker)")"
check "unknown badge refused" "Pick a badge" "$(curl -s -X POST $API/appreciations -H "Authorization: Bearer $MANAGER" -H 'Content-Type: application/json' -d "$(award_json "$APP_ID" not_real)")"
check "outsider cannot award" "worked on this" "$(curl -s -X POST $API/appreciations -H "Authorization: Bearer $OUTSIDER" -H 'Content-Type: application/json' -d "$(award_json "$APP_ID" team_player)")"
check "manager (participant) can award" "appreciation" "$(curl -s -X POST $API/appreciations -H "Authorization: Bearer $MANAGER" -H 'Content-Type: application/json' -d "$(award_json "$APP_ID" dependable)")"

echo; echo "══ PEOPLE & SKILLS · collaboration request ══"
CR=$(curl -s -X POST $API/collab-requests -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' -d '{"targetId":"usr_ishana","taskTitle":"E2E collab","estimatedHours":"3 hours","notes":"e2e"}')
CR_ID=$(printf '%s' "$CR" | jqp 'd.get("id") or d.get("request",{}).get("id","")')
check "collab request created" "cr_" "$CR_ID"
TARGET=$(tok "ananya.reddy@mercedes-benz.com" "$EMPLOYEE_PW")
check "target sees it received" "$CR_ID" "$(curl -s $API/requests/mine -H "Authorization: Bearer $TARGET")"
check "target accepts -> pending_manager" "ok" "$(curl -s -X POST $API/collab-requests/$CR_ID/respond -H "Authorization: Bearer $TARGET" -H 'Content-Type: application/json' -d '{"action":"accepted"}')"
check "target's manager sees it" "$CR_ID" "$(curl -s $API/approvals -H "Authorization: Bearer $MANAGER")"
check "manager signs it off -> accepted" '"status":"accepted"' "$(curl -s -X POST $API/approvals/$CR_ID/decision -H "Authorization: Bearer $MANAGER" -H 'Content-Type: application/json' -d '{"decision":"approved"}')"

echo; echo "══ LEARNING ══"
TRN=$(curl -s -X POST $API/trainings -H "Authorization: Bearer $POSTER" -H 'Content-Type: application/json' -d '{"title":"E2E session","description":"x","sessionDate":"2026-12-01","startTime":"10:00 AM","seatsTotal":1,"skills":["Terraform"]}' | jqp 'd["id"]')
check "session created" "trn_" "$TRN"
check "colleague registers" '"registered"' "$(curl -s -X POST $API/trainings/$TRN/register -H "Authorization: Bearer $APPLICANT")"
check "host cannot self-register" "hosting" "$(curl -s -X POST $API/trainings/$TRN/register -H "Authorization: Bearer $POSTER")"
check "full session waitlists" '"waitlisted"' "$(curl -s -X POST $API/trainings/$TRN/register -H "Authorization: Bearer $OUTSIDER")"
check "cancel promotes waitlist" "ok" "$(curl -s -X POST $API/trainings/$TRN/cancel-registration -H "Authorization: Bearer $APPLICANT")"

echo; echo "══ CARPOOL ══"
TRIP=$(curl -s $API/carpool/trips -H "Authorization: Bearer $APPLICANT" | python3 -c "
import sys,json
for t in json.load(sys.stdin)['trips']:
    if not t['iAmBooked'] and t['myBookingStatus'] is None and t['seatsTotal']>t['seatsBooked']:
        print(t['id'], t['driverId']); break")
TRIP_ID=$(echo $TRIP | cut -d' ' -f1)
BOOK=$(curl -s -X POST $API/carpool/trips/$TRIP_ID/book -H "Authorization: Bearer $APPLICANT")
check "seat requested (pending)" "bookingId" "$BOOK"
BID=$(printf '%s' "$BOOK" | jqp 'd["bookingId"]')
check "rider cannot self-approve" "Only the driver" "$(curl -s -X POST $API/carpool/bookings/$BID/decision -H "Authorization: Bearer $APPLICANT" -H 'Content-Type: application/json' -d '{"decision":"approved"}')"

echo; echo "══ MANAGER ══"
check "manager report scoped to own reports" '"scope": "manager"' "$(curl -s $API/reports -H "Authorization: Bearer $MANAGER" | python3 -m json.tool | head -3)"
check "manager forced off org scope" '"scope": "manager"' "$(curl -s "$API/reports?scope=organisation" -H "Authorization: Bearer $MANAGER" | python3 -m json.tool | head -3)"
check "employee refused reports" "Insufficient permissions" "$(curl -s $API/reports -H "Authorization: Bearer $APPLICANT")"
check "manager reads a report's score" '"score"' "$(curl -s "$API/score?userId=usr_rakesh" -H "Authorization: Bearer $MANAGER")"

echo; echo "══ GDPR / DATA MINIMISATION ══"
check "peer score not readable" "not yours to view" "$(curl -s "$API/score?userId=usr_sangeeta" -H "Authorization: Bearer $APPLICANT")"
check "peer milestones not readable" "not yours to view" "$(curl -s "$API/milestones?userId=usr_sangeeta" -H "Authorization: Bearer $APPLICANT")"
check "directory hides private fields" "clean" "$(curl -s $API/users -H "Authorization: Bearer $APPLICANT" | python3 -c "
import sys,json
us=json.load(sys.stdin)['users']
me='Karthik Iyer'
bad=[u['name'] for u in us if u['name']!=me and any(u.get(k) is not None for k in ('email','contributionScore','hoursConsumed','lastSeen','mustChangePassword'))]
print('clean' if not bad else 'LEAKED: '+', '.join(bad[:3]))")"
check "leaderboard exposes no score" "clean" "$(curl -s "$API/leaderboard?scope=organisation&metric=score" -H "Authorization: Bearer $APPLICANT" | python3 -c "
import sys,json
d=json.load(sys.stdin)
print('clean' if d['metric']!='score' else 'SCORE RANKABLE')")"

echo; echo "══ ADMIN ══"
check "admin overview" "users" "$(curl -s $API/admin/overview -H "Authorization: Bearer $ADMIN")"
check "admin lists badges" "badges" "$(curl -s $API/admin/badges -H "Authorization: Bearer $ADMIN")"
check "employee refused admin badges" "Admin access required" "$(curl -s $API/admin/badges -H "Authorization: Bearer $APPLICANT")"
check "admin creates a badge" '"ok":true' "$(curl -s -X POST $API/admin/badges -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"name":"E2E Badge","dimension":"helping","description":"x","criteria":"y"}')"
check "admin edits it" '"ok":true' "$(curl -s -X PATCH $API/admin/badges/e2e_badge -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"criteria":"edited"}')"
check "admin deletes unused badge" '"retired":false' "$(curl -s -X DELETE $API/admin/badges/e2e_badge -H "Authorization: Bearer $ADMIN")"
check "used badge retires not deletes" '"retired":true' "$(curl -s -X DELETE $API/admin/badges/team_player -H "Authorization: Bearer $ADMIN")"
check "admin creates a tier" '"ok":true' "$(curl -s -X POST $API/admin/tiers -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"name":"E2E Tier","artifact":"knot","minPoints":95,"sortOrder":9}')"
check "admin edits tier name" '"ok":true' "$(curl -s -X PATCH $API/admin/tiers/e2e_tier -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"name":"E2E Tier Renamed"}')"
check "admin previews weighting" "rows" "$(curl -s -X POST $API/admin/recognition/preview -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"hoursWeight":0.5,"contributionsWeight":0.5,"hoursTarget":200,"contributionsTarget":20,"samples":[{"hours":100,"contributions":10}]}')"
check "admin saves weighting" '"ok":true' "$(curl -s -X PATCH $API/admin/recognition/settings -H "Authorization: Bearer $ADMIN" -H 'Content-Type: application/json' -d '{"hoursWeight":0.6,"contributionsWeight":0.4,"hoursTarget":250,"contributionsTarget":25}')"
check "admin removes the test tier" '"ok":true' "$(curl -s -X DELETE $API/admin/tiers/e2e_tier -H "Authorization: Bearer $ADMIN")"
check "employee refused tier edit" "Admin access required" "$(curl -s -X PATCH $API/admin/tiers/contributor -H "Authorization: Bearer $APPLICANT" -H 'Content-Type: application/json' -d '{"name":"nope"}')"

echo; echo "══ READ-ONLY SURFACES (employee) ══"
for ep in /me /sync /users /work-posts /trainings /carpool/trips /approvals /requests/mine \
          /appreciations /appreciations/pending /badges/catalogue /recognition/config \
          /insights /milestones /messages /notifications /community /saved /telemetry \
          /recommendations "/leaderboard?scope=team&metric=badges"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$API$ep" -H "Authorization: Bearer $APPLICANT")
  check "GET $ep" "200" "$code"
done

echo
printf '\033[1m%s passed, %s failed\033[0m\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
