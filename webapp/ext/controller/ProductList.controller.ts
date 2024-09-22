import ControllerExtension from 'sap/ui/core/mvc/ControllerExtension';
import ExtensionAPI from 'sap/fe/templates/ListReport/ExtensionAPI';
import MessageToast from 'sap/m/MessageToast';
import Dialog from 'sap/m/Dialog';
import FileUploader, { FileUploader$ChangeEvent } from 'sap/ui/unified/FileUploader';
import ResourceModel from 'sap/ui/model/resource/ResourceModel';
import ResourceBundle from 'sap/base/i18n/ResourceBundle';
import Messaging from 'sap/ui/core/Messaging';
import Message from 'sap/ui/core/message/Message';
import MessageType from 'sap/ui/core/message/MessageType';
import ODataContextBinding from 'sap/ui/model/odata/v4/ODataContextBinding';
import Fragment from 'sap/ui/core/Fragment';

interface Error {
	message: string
	error: { 
		code: string
		details: Error[] 
	}
}

/**
 * @namespace miyasuta.rapexcelupload.ext.controller
 * @controller
 */
export default class ProductList extends ControllerExtension<ExtensionAPI> {
	dialog: Dialog
	fileType: string
	fileName: string
	fileContent: string | undefined

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
		this.base.getExtensionAPI().loadFragment({
			id: "uploadFileDialog",
			name: "miyasuta.rapexcelupload.ext.fragment.uploadFileDialog",
			// type: "XML",
			controller: this
		}).then(fragment => {
			this.dialog = (fragment as unknown) as Dialog
			this.dialog.open()
		})
	}

	onFileChange(event:FileUploader$ChangeEvent) {
		const files = event.getParameter("files")
		if (files === undefined) {
			return
		}
		const file = files[0] as File
		this.fileType = file.type
		this.fileName = file.name

		const fileReader = new FileReader()
		const that = this
		const readFile = (file: File):Promise<void> => {
			return new Promise(resolve => {
				fileReader.onload = function (loadEvent) {
					const result = loadEvent.target?.result as string
					const match = result.match(/,(.*)$/)
					if (match && match[1]) {
						that.fileContent = match[1]
						resolve()
					}
					
				}
				fileReader.readAsDataURL(file)
			})
		}

		this.base.getExtensionAPI().getEditFlow().securedExecution(() => readFile(file))
	}

	onUploadPress() {
		const resourceBundle = (this.base.getExtensionAPI().getModel("i18n") as ResourceModel).getResourceBundle() as ResourceBundle
		if (this.fileContent === undefined || this.fileContent === "") {
			const fileErrorMessage = resourceBundle.getText("uploadFileErrMeg") || ""
			MessageToast.show(fileErrorMessage)
			return
		}

		const model = this.base.getExtensionAPI().getModel()
		const namespace = "com.sap.gateway.srvd.zui_yproduct_o4.v0001."
		const operation = model?.bindContext("/Product/" + namespace + "fileUpload(...)") as ODataContextBinding
		const funSuccess = () => {
			model?.refresh()
			const uploadSuccessMessage = resourceBundle.getText("uploadFileSuccMsg") || ""
			MessageToast.show(uploadSuccessMessage)
			this.dialog.close();

			//clear the file name from file Uploader
			(Fragment.byId("uploadFileDialog","idFileUpload") as FileUploader).clear()
			this.dialog.destroy()
			this.fileContent = undefined
		}
		const fnError = (oError:Error) => {
			this.base.getExtensionAPI().getEditFlow().securedExecution(
				() => {
					Messaging.addMessages(
						new Message({
							message: oError.message,
							target: "",
							persistent: true,
							type: MessageType.Error,
							code: oError.error.code
						})
					)
					const errorDetails = oError.error.details
					errorDetails.forEach(error => {
						Messaging.addMessages(
							new Message({
								message: error.message,
								target: "",
								persistent: true,
								type: MessageType.Error,
								code: error.error.code
							})
						)
					})

					this.dialog.close();
					//clear the file name from file Uploader
					(Fragment.byId("uploadFileDialog","idFileUpload") as FileUploader).clear()
					this.dialog.destroy()
					this.fileContent = undefined					
				}
			)
		}

		operation.setParameter("mimeType", this.fileType)
		operation.setParameter("fileName", this.fileName)
		operation.setParameter("fileContent", this.fileContent)
		operation.invoke().then(funSuccess, fnError)

	}

	onCancelPress () {
		this.dialog.close();
		this.dialog.destroy()
		this.fileContent = undefined
	}
}