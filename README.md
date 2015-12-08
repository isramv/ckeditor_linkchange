# How to create a ckeditor plugin for WYSIWYG module in D7 ckeditor 4.

##My settings.

* Drupal 7
* WYSIWYG Version 7.x-2.2
* ckeditor 4.5.1

## Adding suppor for ckeditor 4

go to `wysiwyg/editors/ckeditor.inc` search the following line 

`if (preg_match('@version:\'(?:CKEditor )?([\d\.]+)(?:.+revision:\'([\d]+))?@', $line, $version)) {`

replace it with:

 `if (preg_match('@version:[\'"](?:CKEditor )?([\d\.]+)(?:.+revision:[\'"]([[:xdigit:]]+))?@', $line, $version)) {`



## Requirements.

I created a simple ckeditor plugin that allows non technical writers to change the text of a URL only by selecting (partially) the link and editing the content in a prompt.

this small plugin allows the end users to avoid typos and deleting the url by mistake.

but in order to make this plugin works in Drupal I need to create a plugin for the WYSIWYG Drupal module (the drupal way).

We need to let know the WYSIWYG module that we wanted to implement a new plugin for our ckeditor, so we use the following hook.

## the Drupal 7 Module:

folder structure:

	- ckeditor_linkchange/ <- Drupal 7 Module folder.
		- plugins/
			- linkchange/ <- Actual ckeditor plugin.
		- ckeditor_linkchange.info <- Drupal 7 info file.
		- ckeditor_linkchange.module <- Drupal 7 module file.

### ckeditor_linkchange.info

this file declare our module and it's dependencies:

	name = "Ckeditor linkchange plugin"
	description = "Adds the ability to change the text or a url with the linkchange button (CKEditor)"
	package = Custom
	dependencies[] = wysiwyg
	core = 7.x

### ckeditor_linkchange.module

the `hook_wysiwyg_plugin().` let's the WYSIWYG module know that we have a new plugin available.

	<?php
	
	/**
	 * Implements hook_wysiwyg_plugin().
	 *
	 */
	function ckeditor_linkchange_wysiwyg_plugin($editor, $version) {
	    $plugins = array();
	    switch ($editor) {
	        case 'ckeditor':
	            if ($version > 4) {
	                $plugins['linkchange'] = array(
	                    'path' => drupal_get_path('module', 'ckeditor_linkchange') . '/plugins/linkchange',
	                    'filename' => 'plugin.js',
	                    'load' => TRUE,
	                    'buttons' => array(
	                        'linkchange' => t('Linkchange'),
	                    ),
	                );
	            }
	            break;
	    }
	    return $plugins;
	}

In my case I checked that the ckeditor version is superior to version number 4.
the array $plugins['linkchange'] contains the path to the plugin and the buttons paramenter allows this plugin to be enabled from the WYSIWYG UI. that can always be found on: `mysite.com/admin/config/content/wysiwyg/~profile~/edit`

when edition a profile enable the plugin and the button should appear.

# the ckeditor plugin.

	- linkchange/
		- dialogs/
			- linkchange.js
		- icons/
			- linkchange.png	
		- plugin.js

### plugin.js
	
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

### dialogs/linkchange.js

	CKEDITOR.dialog.add( 'linkchangeDialog', function( editor ) {
		return {
			title: 'Text link change',
			minWidth: 400,
			minHeight: 200,
			contents: [
				{
					id: 'tab-basic',
					label: 'Basic Settings',
					elements: [
						{
							type: 'text',
							id: 'txtchng',
							label: 'Text update',
							setup: function( element ) {
								this.setValue( element.getText() );
							},
							commit: function( element ) {
								element.setText( this.getValue() );
							}
						}
					]
				}
			],
			onShow: function() {
				var selection = editor.getSelection();
				var element = selection.getStartElement();
				this.element = element;
				if(element.$.nodeName === "A") { // Only if it's and anchor.
					this.setupContent( this.element );
				} else {
					this.hide();
				}
			},
			onOk: function() {
				var txt = this.element;
				this.commitContent( txt );
				if ( this.insertMode )
					editor.insertElement( txt );
			}
		};
	});

the complete module can be found [here](https://github.com/isramv/ckeditor_linkchange) you can take it as reference to implement yours.
