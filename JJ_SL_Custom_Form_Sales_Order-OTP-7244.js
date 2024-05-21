/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/*****************************************************************************************************************************************************************************************
**************************
*
*${OTP-7244}:${Custom page for display sales order based on the status}
*
******************************************************************************************************************************************************************************************
**************************
 *
 * Author : Jobin and Jismi
 *
 * Date Created : 16-May-2024
 *
 * Created by :Sanjay Kushwaha, Jobin and Jismi IT Services.
 *
 * Description :
    Create a custom form that will display sales orders which need to be fulfilled or billed.
        The sublist columns contains ,
        Internal IDs,Document Name,Date,Status,Customer Name,Subsidiary,Department,Class,Line Number,Subtotal,Tax,Total
        The page should contains the following filters,
        Status
        Customer
        Subsidiary
        Department

    The value should be update dynamically based on the filters.
 *
 * REVISION HISTORY :
 *
 *****************************************************************************************************************************************************************************************
******************************/
define(['N/search', 'N/ui/serverWidget'],
    (search, serverWidget) => {
        //Code to create Filter and pass that filetr to the saveSearch 
        const salesOrderFilter = (subsidiary, customer, status, department) => {
            try {
                const filters =[
                    ["type","anyof","SalesOrd"], 
                    "AND", 
                    ["mainline","is","T"], 
                    "AND", 
                    ["status","noneof","SalesOrd:C","SalesOrd:G","SalesOrd:H","SalesOrd:A"]
                 ]
                log.debug('filters', filters)
                if (subsidiary) {
                    filters.push('AND', ['subsidiary', 'is', subsidiary]);
                }
                if (customer) {
                    filters.push('AND', ['entity', 'is', customer]);
                }
                if (status) {
                    filters.push('AND', ['status', 'is', status]);
                }
                if (department) {
                    filters.push('AND', ['department', 'is', department]);
                }
                return filters;
            } catch (e) {
                // Log any errors that occur during execution
                log.error({
                    title: 'Suitelet Error',
                    details: e.message
                });
            }
        }
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                //Code to create form
                let salesOrderdetails = serverWidget.createForm({
                    title: 'Sales Order Details'
                });
                //code to call the clientScript file
                salesOrderdetails.clientScriptFileId = 3805;

                //Code to link the url for another Page
                salesOrderdetails.addPageLink({
                    type : serverWidget.FormPageLinkType.CROSSLINK,
                    title : 'Sales Order Save Search',
                    url : 'https://td2908244.app.netsuite.com/app/common/search/searchresults.nl?searchid=132&saverun=T&whence='
                })
                //code to add Field Group
                salesOrderdetails.addFieldGroup({
                    id: '_jj_filter',
                    label: 'FILTER'
                });
                //code to add field inside Field Group
                var salesOrderStatus = salesOrderdetails.addField({
                    id: 'sales_status',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Status',
                    container:'_jj_filter'
                });
                //code to add the selection option for the field 
                salesOrderStatus.addSelectOption({
                    value: '',
                    text: '--Select Status--'
                });
                salesOrderStatus.addSelectOption({
                    value: 'SalesOrd:B',
                    text: 'Pending Fulfillment'
                });
                salesOrderStatus.addSelectOption({
                    value: 'SalesOrd:D',
                    text: 'Partially Fulfilled'
                });
                salesOrderStatus.addSelectOption({
                    value: 'SalesOrd:E',
                    text: ' Pending Billing/Partially Fulfilled'
                });
                salesOrderStatus.addSelectOption({
                    value: 'SalesOrd:F',
                    text: 'Pending Billing'
                });
                //set the default value for the Status Field.
                salesOrderStatus.defaultValue = scriptContext.request.parameters.clientScriptStatus;
                //Code to add Custoemr field inside field group of the form
                let salesOrderCust = salesOrderdetails.addField({
                    id: 'sales_customer',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Customer',
                    source: 'customer',
                    container:'_jj_filter'
                });
                //Code to set the default value for the Customer Field.
                salesOrderCust.defaultValue = scriptContext.request.parameters.clientScriptCustomer;
                //Code to add Subsidiary field inside field group of the form
                let salesorderSubdisiary = salesOrderdetails.addField({
                    id: 'sales_subsidiary',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Subsidiary',
                    source: 'subsidiary',
                    container:'_jj_filter'
                });
                //Code to set the default value for the Subsidiary Field.
                salesorderSubdisiary.defaultValue = scriptContext.request.parameters.clientScriptSubsidiary;
                //Code to add Department Field inside field group of the form
                let saleOrderDepartment = salesOrderdetails.addField({
                    id: 'sales_department',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Department',
                    source:'department',
                    container:'_jj_filter'
                });
                //Code to set the default value for the Department Field.
                saleOrderDepartment.defaultValue = scriptContext.request.parameters.clientScriptDepartment;
                //Code to add Sublist 
                var sublist = salesOrderdetails.addSublist({
                    id: 'sublist_result',
                    type: serverWidget.SublistType.LIST,
                    label: 'SalesOrder Search Result'
                });
                // Code to add InternalID field inside Sublist
                sublist.addField({
                    id: 'internal_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Internal ID'
                });
                // Code to add Document Number field inside Sublist
                sublist.addField({
                    id: 'document_num',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Document Number'
                });
                // Code to add Date field inside Sublist
                sublist.addField({
                    id: 'sales_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date'
                });
                // Code to add Status field inside Sublist
                sublist.addField({
                    id: 'sales_status',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Status'
                });
                // Code to add Customer Name field inside Sublist
                sublist.addField({
                    id: 'cust_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Customer Name'
                });
                // Code to add Sybsidiary field inside Sublist
                sublist.addField({
                    id: 'sales_subsidiary',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Subsidiary'
                });
                // Code to add Department field inside Sublist
                sublist.addField({
                    id: 'department',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Department'
                });
                // Code to add Class field inside Sublist
                sublist.addField({
                    id: 'sales_class',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Class'
                });
                
                //Code to add Sub-Total field inside Sublist
                    sublist.addField({
                    id: 'sales_subtotal',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'SubTotal'
                });
                    // Code to add tax field inside Sublist
                    sublist.addField({
                    id: 'sales_tax',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Tax Amount'
                });

                    // Code to add Total field inside Sublist
                    sublist.addField({
                    id: 'sales_total',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total'
                });
                //Search to find Sales Orders to be fulfilled & billed.
                let salesOrderSaveSearch = search.create({
                    title: 'Sales_order_search',
                    type: search.Type.SALES_ORDER,
                    columns:
                    [
                        search.createColumn({name: "internalid", label: "Internal ID"}),
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "trandate", label: "Date"}),
                        search.createColumn({name: "statusref", label: "Status"}),
                        search.createColumn({name: "entity", label: "Name"}),
                        search.createColumn({name: "subsidiary", label: "Subsidiary"}),
                        search.createColumn({name: "department", label: "Division"}),
                        search.createColumn({name: "class", label: "Sales Channel"}),
                        search.createColumn({name: "grossamount", label: "Gross Amount"}),
                    ],
                    filters: salesOrderFilter(salesorderSubdisiary.defaultValue, salesOrderCust.defaultValue, salesOrderStatus.defaultValue, saleOrderDepartment.defaultValue)
                });
                let runSaveSearch = salesOrderSaveSearch.run();
                let saveSearchResult = runSaveSearch.getRange({start: 0, end: 1000});

                //Code to Display Details of sales order in sublist 
                let taxamount='0';
                let lineCount = 0;
                for (let i = 0; i < saveSearchResult.length; i++) {
                    //Code to display InternalID In Sublist
                    let InternalID = saveSearchResult[i].getText('internalid');
                    sublist.setSublistValue({
                        id: 'internal_id',
                        line: lineCount,
                        value: InternalID
                    });
                    //code to display Document Number in sublist
                    let DocName = saveSearchResult[i].getValue('tranid');
                    sublist.setSublistValue({
                        id: 'document_num',
                        line: lineCount,
                        value: DocName
                    })
                    //code to Display Date in sublist
                    let salesDate = saveSearchResult[i].getValue('trandate');
                    sublist.setSublistValue({
                        id: 'sales_date',
                        line: lineCount,
                        value: salesDate
                    });
                    //code to Display Status
                    let salesStatus = saveSearchResult[i].getText('statusref');
                    sublist.setSublistValue({
                        id: 'sales_status',
                        line: lineCount,
                        value: salesStatus
                    });
                    //code to display Customer Name 
                    let customerName = saveSearchResult[i].getText('entity');
                    sublist.setSublistValue({
                        id: 'cust_name',
                        line: lineCount,
                        value: customerName
                    });
                    //Code to Display Subsidiary
                    let salesSubsidiay = saveSearchResult[i].getText('subsidiary');
                    if (salesSubsidiay) {
                        sublist.setSublistValue({
                            id: 'sales_subsidiary',
                            line: lineCount,
                            value: salesSubsidiay
                        })
                    }
                    // COde to Diaplay Department
                    let salesDepartment = saveSearchResult[i].getText('department');
                    if (salesDepartment) {
                        sublist.setSublistValue({
                            id: 'department',
                            line: lineCount,
                            value: salesDepartment
                        });
                    }
                    //Code to Display Class
                    let salesClass = saveSearchResult[i].getText('class');
                    if (salesClass) {
                        sublist.setSublistValue({
                            id: 'sales_class',
                            line: lineCount,
                            value: salesClass
                        });
                    }
                    // Code to  Display Total 
                    let subTotal = saveSearchResult[i].getValue('grossamount');
                    sublist.setSublistValue({
                        id: 'sales_subtotal',
                        line: lineCount,
                        value: subTotal
                    });
                    sublist.setSublistValue({
                        id: 'sales_tax',
                        line: lineCount,
                        value: taxamount
                    });
                    var totalAmount=subTotal + taxamount;
                    sublist.setSublistValue({
                        id: 'sales_total',
                        line: lineCount,
                        value: totalAmount
                    });

                    //increase linecount by +1
                    lineCount=lineCount + 1;
                }
                scriptContext.response.writePage(salesOrderdetails);
            }
        }

        return {onRequest}

    });
