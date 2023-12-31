
#importing requests library so that we can get requests from API
import requests
from flask import Flask
from flask import request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

#---------------------ATTAIN API USAGE--------------------------

#Made a list of all U.S. Abbreviation in case we decide to use a dropdown
stateAbbreviation = (["AL","AK","AZ","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
                      "ME","MD","MA","MI","MN","MS","MO","MT","NE","NH","NV","NJ","NM","NY","ND","NC","OH",
                      "OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"])

#This function works by taking the user input for their state abbreviation and finding out its orgCode
def searchStateCode(stateAB):
    
    #Error Checking to see if user inputted something longer than 2
    if (len(stateAB) > 2):
        #Error Message
        return "Error Message: Invalid State Abbreivation. Please enter a valid State Abbreviation"

    #This is the url for the attain api to search for OrgStateCodes, needed to data on that State
    baseURL = "https://attains.epa.gov/attains-public/api/domains?domainName=OrgStateCode"
    #Pulls required info from baseURL
    info = requests.get(baseURL)

    #Formats it to json
    orgCodeData = info.json()
    stateCode = ""
    #Searchs for user input of state and stores its orgCode if found
    for i in orgCodeData:
        if (stateAB in i["name"]):
            if ( i["context2"] == "State"):

                stateCode = i["context"]
                print(stateCode)
    #Error testing to make sure state code has a value
    if (stateCode != ""):
        return stateCode
    else:
        return "Error Message: State not found"

#Function for getting a summary of the state water data
def StateSummary(stateAB):
    #pulls state code from previous function
    stateCode = searchStateCode(stateAB)

    #URL for summary of the State Data
    baseURL = "https://attains.epa.gov/attains-public/api/usesStateSummary?organizationId="
    url = baseURL + stateCode
    info = requests.get(url)
    data = info.json()

    #Just prints the data. Still developing which data values will be of most use for project
    print(data)

def stateAssessments(stateAb):
    stateCode = searchStateCode(stateAb)
    baseURL = "https://attains.epa.gov/attains-public/api/assessments?organizationId="
    info = requests.get(baseURL + stateCode)
    data = info.json()

    print(data)


def getAUI(stateAB,county):
    baseURL = "https://attains.epa.gov/attains-public/api/assessmentUnits?"
    stateCode = "stateCode=" + stateAB
    countyCode = "&county=" + county
    info = requests.get(baseURL + stateCode + countyCode)
    data = info.json()
    allUnitNames = []
    allAUI = []
    NameAndAUI = []

    for i in data["items"][0]["assessmentUnits"]:
        allAUI.append(i["assessmentUnitIdentifier"])
        allUnitNames.append(i["assessmentUnitName"])
    NameAndAUI.append(allUnitNames)
    NameAndAUI.append(allAUI)
    print(NameAndAUI)
    return NameAndAUI

@app.route("/bodies")
def get_bodies():
    return getAUI(request.args.get("state"), request.args.get("county"))
    
#
def getWaterInfo(stateAB, AUI):
    baseURL = "https://attains.epa.gov/attains-public/api/assessments?"
    stateCode = "state=" + stateAB
    AUICode = "&assessmentUnitIdentifier=" + AUI
    print(AUI)
    info = requests.get(baseURL + stateCode + AUICode)
    data = info.json()
    waterUSE = {}
    parameters = {}
        
    if len(data["items"][0]["assessments"]) != 0:
        for i in data["items"][0]["assessments"][0]["useAttainments"]:
            waterUSE[i["useName"]] = i["useAttainmentCodeName"]

        for i in data["items"][0]["assessments"][0]["parameters"]:
            parameters[i["parameterName"]] = [i["parameterStatusName"], i["pollutantIndicator"]]
            
        #pollutantIndicator = (i["parameterStatusName"])


    #totalPollutantInfo = parameter | parameterStatus | pollutantIndicator
    print(parameters)
    print(waterUSE)
    return [waterUSE, parameters]

def PollutantCategorize(stateAB,AUI):
    baseURL = "https://attains.epa.gov/attains-public/api/assessments?"
    stateCode = "state=" + stateAB
    AUICode = "&assessmentUnitIdentifier=" + AUI
    print(AUI)
    info = requests.get(baseURL + stateCode + AUICode)
    data = info.json()
    parameters = {}
    
    for i in data["items"][0]["assessments"][0]["parameters"]:
        parameters[i["parameterName"]] = [i["parameterStatusName"], i["pollutantIndicator"]]

    print(parameters)

    secondaryURL = "https://attains.epa.gov/attains-public/api/domains?domainName=ParameterName"
    categories = requests.get(secondaryURL)
    categories = categories.json()

    CategorizedPollutants = set()

    for i in parameters:
        for j in categories:
            if (i in j["name"]):
                CategorizedPollutants.add(j["context"])



    print(CategorizedPollutants)
    return CategorizedPollutants



@app.route("/")
def hello_world():
    return "Hello world!"

@app.route("/county-info")
def getCounty():
    stateID = "CA"
    county = request.args.get('county')
    AUI = getAUI(stateID, county)
    wInfo = getWaterInfo(stateID, AUI[1][0])[0]
    return {"body_of_water" : AUI[0][0], "info" : wInfo}

@app.route("/body")
def getWaterbody():
    aui = request.args.get('aui')
    wInfo = getWaterInfo('CA', aui)[0]
    return wInfo


@app.route("/body/pollutants")
def getParameters():
    aui = request.args.get('aui')
    paramInfo = getWaterInfo('CA', aui)[1]
    return paramInfo

#Test Cases for California
#searchStateCode("CA")
#StateSummary("CA")
#stateAssessments("CA")
#getWaterInfo("CA","CAR5412000020080820161412")
PollutantCategorize("CA","CAR5412000020080820161412")
