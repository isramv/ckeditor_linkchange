(function($) {
	CKEDITOR.plugins.add( 'linkchange', {
		icons: 'linkchange',
		init: function( editor ) {
			editor.addCommand( 'linkchange', new CKEDITOR.dialogCommand( 'linkchangeDialog' ) );
			editor.ui.addButton( 'linkchange', {
				label: 'Link text change',
				command: 'linkchange',
				toolbar: 'linkchange'

			});
			if ( editor.contextMenu ) {
				editor.addMenuGroup( 'linkchangeGroup' );
				editor.addMenuItem( 'linkchangeItem', {
					label: 'Change link',
					icon: this.path + 'icons/linkchange.png',
					command: 'linkchange',
					group: 'linkchangeGroup'
				});
				editor.contextMenu.addListener( function( element ) {
					if ( element.getAscendant( 'linkchange', true ) ) {
						return { abbrItem: CKEDITOR.TRISTATE_OFF };
					}
				});
			}
			CKEDITOR.dialog.add( 'linkchangeDialog', this.path + 'dialogs/linkchange.js' );
		}
	});
})(jQuery);