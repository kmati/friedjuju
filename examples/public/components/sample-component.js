export const SampleComponent = {
	containerElement: null, // the element in the DOM that will contain this component

	route: '/user/:userId',

	template: function (data) {
		return `<div>
				<div>Name: ${data.firstName} ${data.lastName}</div>
				<div>Age: ${data.age}</div>
			</div>`;
	}

	onActivated: function (req, next) {
		const userId = req.params.userId;

	}
};
