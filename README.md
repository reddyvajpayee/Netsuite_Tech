📁 Repository Structure
1. Map Reduce Hard Limits

Folder:
src/FileCabinet/SuiteScripts/Map Reduce Hard Limits/

This module focuses on NetSuite Map/Reduce script hard limits, especially the 200MB persisted data limit.
It includes:

A Bulk Data Generation M/R Script that creates large volumes of test records (13–15 lakh).

A Persisted Data Overflow M/R Script designed to intentionally hit the PERSISTED_DATA_LIMIT_FOR_MAPREDUCE_SCRIPT_EXCEEDED error.

A custom record (customrecord_persisted_data_record) used for testing.

A folder-level README detailing:

How to reproduce the error



2. Pagination

Folder:
src/FileCabinet/SuiteScripts/Pagination/

This module demonstrates Server-side Pagination in Suitelet using search.runPaged().
It includes:

A Suitelet script that loads 25,000+ records and paginates efficiently.

A sample data file (employee_data_25000.csv).

Folder-level README covering:

Pagination logic

Steps to upload and test


🚀 How to Use This Repo

Deploy the project using SDF
All required custom records, scripts, and files will be uploaded automatically.

Explore each folder
Every folder includes its own README describing:

Purpose

Setup steps

Error reproduction

Sample data

Explanations

Run scripts in NetSuite Sandbox/Test Account
Follow instructions inside each folder README.