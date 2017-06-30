
# FLP Extensibility Plugin UI5Con Hands-on June 2017

This plugin serves as a sample implementation for FLP extensibility plugins and was created to showcase general capabilities and a sample scenario .

The coding does not outline current best practices and could be enhanced over time by more compelling features and capabilities.

Still it can be run in the current state. 

## HOW TO RUN THE PLUGIN FROM SAP WEB IDE

After importing the project into WebIDE via git clone one could run it in a sandboxed mode like this:

1. In SAP Web IDE, right-click on "Component.js"
2. Choose "Run" > "Run Configurations" 
3. In the dialog create a new configuration from "SAP Fiori Launchpad on Sandbox"
4. As a file to run choose "/fioriSandboxConfig.json"
5. In the tab "URL Components" enter #Shell-home as URL Hash Fragment
6. Press "Save and Run"