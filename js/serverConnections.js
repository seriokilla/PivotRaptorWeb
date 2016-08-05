var currentCid = "1452485554";
var currentIndustry = "Aviation";

function pageLoad() {
    getCustomers();
    getIndustries();
}

function getCustomers() {
    $.ajax({
        type: "POST",
        url: "http://nc-dev-1038.dev.com:7474/db/data/transaction/commit",
        data: JSON.stringify({
            "statements": [{
                "statement": "MATCH (n:Analyst) WHERE n.CID = \"1452485554\" OR (n.CID=\"1452483903\" AND n.CompanyName=\"Citigroup Virtual Subsidiary\") OR (n.CID=\"1452485033\" AND n.CompanyName=\"Mizuho Holdings Incorporated\") OR (n.CID=\"1452483787\" AND n.CompanyName=\"Raymond James & Associates\") RETURN DISTINCT n.CID, n.CompanyName ORDER BY n.CompanyName"
            }]
        }),
        contentType: "application/json",
        success: function (result) {
            var customerData = result.results[0].data;
            //console.log(customerData);

            customerJSON = [];

            for (var i = 0; i < customerData.length; i++) {
                customerJSON.push({
                    "cid": customerData[i].row[0],
                    "customer": customerData[i].row[1],
                });
            }

            $("#customers").kendoDropDownList({
                dataSource: customerJSON,
                dataTextField: "customer",
                dataValueField: "cid",
                change: onChange
            });

            function onChange() {
                currentCid = $("#customers").data("kendoDropDownList").value();
            };
        }
    });
}

function getIndustries() {
    $.ajax({
        type: "POST",
        url: "http://nc-dev-1038.dev.com:7474/db/data/transaction/commit",
        data: JSON.stringify({
            "statements": [{
                "statement": "MATCH (n:Industry) RETURN distinct n.IndustryName as Industry ORDER BY n.IndustryName ASC LIMIT 3000"
            }]
        }),
        contentType: "application/json",
        success: function (result) {
            var industryData = result.results[0].data;
            //console.log(industryData);

            industryJSON = [];

            for (var i = 0; i < industryData.length; i++) {
                industryJSON.push({
                    "industry": industryData[i].row[0]
                });
            }

            $("#industries").kendoDropDownList({
                dataSource: industryJSON,
                dataTextField: "industry",
                change: onChange
            });

            function onChange() {
                currentIndustry = $("#industries").data("kendoDropDownList").text();
            };
        }
    });
}

function getContacts() {
    $.ajax({
        type: "POST",
        url: "http://nc-dev-1038.dev.com:7474/db/data/transaction/commit",
        data: JSON.stringify({
            "statements": [{
                "statement": "MATCH (i:Industry)-[:COVERED_BY]->(a:Analyst) MATCH (a)-[:MET_WITH]->(c:Contact) MATCH (c)-[:WORKS_AT]->(v:Investor) WHERE i.IndustryName = {industry} AND a.CID= {cid} RETURN a.IndustryName as Industry, a.CompanyName as CompanyName, a.FirstName + \" \" + a.LastName as Analyst,c.FirstName + \" \" + c.LastName as InvestorContact, c.Email as Email,v.InvestorName as InvestorName LIMIT 500",
                "parameters": {
                    "cid": currentCid,
                    "industry": currentIndustry
                }
            }]
        }),
        contentType: "application/json",
        success: function (result) {
            var contactData = result.results[0].data;

            contactJSON = [];

            for (var i = 0; i < contactData.length; i++) {
                contactJSON.push({
                    "industry": contactData[i].row[0],
                    "companyName": contactData[i].row[1],
                    "analyst": contactData[i].row[2],
                    "investorContact": contactData[i].row[3],
                    "email": contactData[i].row[4],
                    "investorName": contactData[i].row[5],
                    "holdings": Math.floor((Math.random() * 1000000) + 100000)
                });
            }
            //console.log(contactJSON);

            $("#grid").kendoGrid({
                dataSource: {
                    data: contactJSON,
                    pageSize: 20,
                    schema: {
                        model: {
                            fields: {
                                industry: { editable: false, nullable: true },
                                companyName: { editable: false, nullable: true },
                                analyst: { editable: false, nullable: true },
                                investorContact: { editable: false, nullable: true },
                                email: { editable: false, nullable: true },
                                investorName: { editable: false, nullable: true },
                                holdings: { editable: false, nullable: true }
                            }
                        }
                    },
                    sort: {
                        field: "holdings",
                        dir: "desc"
                    }
                },
                pageable: {
                    buttonCount: 10
                },
                sortable: true,
                filterable: true,
                messages: {
                    noRecords: "No records available."
                },
                columns: [
                    {
                        field: "analyst",
                        title: "<b>Analyst</b>"
                    }, {
                        field: "investorContact",
                        title: "<b>Investor Contact</b>",
                    }, {
                        field: "email",
                        title: "<b>Email</b>"
                    }, {
                        field: "investorName",
                        title: "<b>Investor Name</b>"
                    }, {
                        field: "holdings",
                        title: "<b>Holdings ($)</b>",
                        format: "{0:c2}"
                    }
                ],
            });
        }
    });
}