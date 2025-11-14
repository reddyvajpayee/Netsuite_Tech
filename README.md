📘 Employee Pagination Suitelet (NetSuite SDF Project)

This project demonstrates pagination in NetSuite using SuiteScript 2.1.
It includes a Suitelet that loads employee data stored in a custom record and displays it in the UI with Next / Previous navigation, leveraging search.runPaged() for efficient handling of large datasets (25,000+ rows).

The repository also includes a CSV file to preload sample employee data into NetSuite’s custom record.

---------------------
🚀 Features

Pagination powered by search.runPaged()

Handles unlimited records (tested with 25,000 employees)

Styled navigation buttons (Prev / Next)

Hidden page tracking field

Clean Suitelet UI layout

Detailed logs for debugging

CSV included to generate test data

---------------------

SDF-ready project structure

📂 Folder Structure
src/
│
├── FileCabinet/
│   └── SuiteScripts/
│       └── Pagination/
│           ├── Suitelets/
│           │   └── SL_EmployeePagination.js
│           └── CSV Import Files/
│               └── employee_data_25000.csv
│
└── Objects/
    └── customscript_sl_employeepagination.xml

manifest.xml
README.md

---------------------

🔧 Technical Details
Custom Record

customrecord_employee_record

Fields

custrecord_employee_id – Employee ID

name – Employee Name

---------------------

Suitelet Script
Field	Value
Script Name	SL_Precise_EmployeePagination_v2
Script ID	customscript_sl_employeepagination
Deployment ID	customdeploy_sl_employeepagination
Path	/SuiteScripts/Pagination/Suitelets/SL_EmployeePagination.js

---------------------

📥 How to Upload the CSV into NetSuite

📤 Import CSV into Custom Record

Navigate to:
Setup → Import/Export → Import CSV Records

Record Type: Custom Record → Employee Record

Upload the CSV file

Map fields:

Employee ID → custrecord_employee_id

Employee Name → name

Run the import

After import, all 25,000 records will be available for Suitelet pagination.

---------------------

▶️ Running the Suitelet

Go to Customization → Scripting → Script Deployments

Open your Suitelet deployment

Click Deployment URL

View paginated employee results (50 per page)

Use Prev / Next buttons to navigate across pages
