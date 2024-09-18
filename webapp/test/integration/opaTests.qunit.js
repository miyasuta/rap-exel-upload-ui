sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'miyasuta/rapexcelupload/test/integration/FirstJourney',
		'miyasuta/rapexcelupload/test/integration/pages/ProductList',
		'miyasuta/rapexcelupload/test/integration/pages/ProductObjectPage'
    ],
    function(JourneyRunner, opaJourney, ProductList, ProductObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('miyasuta/rapexcelupload') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheProductList: ProductList,
					onTheProductObjectPage: ProductObjectPage
                }
            },
            opaJourney.run
        );
    }
);