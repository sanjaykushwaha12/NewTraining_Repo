/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search) => {
       

        function getInputData(context) {
            // Search for sales data from the previous month
            var salesSearch = search.create({
                type: 'salesorder',
                filters: [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
                columns: [
                search.createColumn({ name: "entity", label: "Name" }),
                search.createColumn({ name: "amount", label: "Amount" }),
                ]
            });
            return salesSearch;
        }
        const map = (mapContext) => {
            var searchResult = JSON.parse(mapContext.value);
            var customerId = searchResult.values['entity'].text;
            var salesAmount = searchResult.values['amount'];
            mapContext.write(customerId, salesAmount);
        }
        const reduce = (context) => {
            let customerId = context.key;
            let salesAmounts = context.values;
            let totalAmount = 0;
            salesAmounts.forEach((amount) => {
                totalAmount= totalAmount +parseFloat(amount);
            });
            log.debug({
                title: customerId,
                details: totalAmount
            });
        }
        const summarize = (summaryContext) => {

        }

        return { getInputData, map, reduce, summarize }

    });