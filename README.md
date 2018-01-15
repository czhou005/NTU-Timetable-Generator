# NTU-Timetable-Generator

## Steps to Generate an iCal
1) Go into STARS Planner https://sso.wis.ntu.edu.sg/webexe88/ntlm/sso_express.asp?app=https://wish.wis.ntu.edu.sg/pls/webexe/aus_stars_planner.main
2) Load up your plan and click "Printable Page", save it as "timetable.html"
3) Clone this repo `git clone https://github.com/tjunxiang92/NTU-Timetable-Generator.git`
4) Put "timetable.html" into the "NTU-Timetable-Generator"
5) In your Command Prompt, run the following commands
```
cd <Directory>/NTU-Timetable-Generator
npm install
node index.js
```
6) A file "ntu.ical" will be generated.