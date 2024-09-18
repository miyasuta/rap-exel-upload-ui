import ControllerExtension from 'sap/ui/core/mvc/ControllerExtension';
import ExtensionAPI from 'sap/fe/templates/ListReport/ExtensionAPI';
import MessageToast from 'sap/m/MessageToast';

/**
 * @namespace miyasuta.rapexcelupload.ext.controller
 * @controller
 */
export default class ProductList extends ControllerExtension<ExtensionAPI> {
	static overrides = {
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf miyasuta.rapexcelupload.ext.controller.ProductList
		 */
		onInit(this: ProductList) {
			// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
			const model = this.base.getExtensionAPI().getModel();
		}		
	}

	uploadProduct() {
		debugger;
		MessageToast.show("Custom handler invoked.")
	}
}