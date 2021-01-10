fbuilderjQuery = (typeof fbuilderjQuery != 'undefined' ) ? fbuilderjQuery : jQuery;
fbuilderjQuery(function(){
(function($) {
	// Namespace of fbuilder
	$.fbuilder = $.fbuilder || {};
	$.fbuilder[ 'objName' ] = 'fbuilderjQuery';	
	
	$.fbuilder[ 'controls' ] = {};
	$.fbuilder[ 'forms' ] = {};
	
	$.fbuilder[ 'htmlEncode' ] = function(value)
	{
		value = $('<div/>').text(value).html()
		value = value.replace(/"/g, "&quot;").replace( /&/g, '&amp;');
		return value;
	};
	
	$.fbuilder[ 'escape_symbol' ] = function( value ) // Escape the symbols used in regulars expressions
	{
		return value.replace(/([\^\$\-\.\,\[\]\(\)\/\\\*\?\+\!\{\}])/g, "\\$1");
	};
				
	$.fbuilder[ 'parseVal' ] = function( value, thousandSeparator, decimalSymbol )
	{
		if( value == '' ) return 0;
		value += '';
		
		thousandSeparator = new RegExp( $.fbuilder.escape_symbol( ( typeof thousandSeparator == 'undefined' ) ? ',' : thousandSeparator ), 'g' );
		decimalSymbol = new RegExp( $.fbuilder.escape_symbol( ( typeof decimalSymbol == 'undefined' ) ? '.' : decimalSymbol ), 'g' );
		
		var t = value.replace( thousandSeparator, '' ).replace( decimalSymbol, '.' ).replace( /\s/g, '' ),
			p = /[+-]?((\d+(\.\d+)?)|(\.\d+))/.exec( t );
			
		return ( p ) ? p[0]*1 : '"' + value.replace(/'/g, "\\'").replace( /\$/g, '') + '"';
	};
				
	
	$.fn.fbuilder = function(options){
		var opt = $.extend({},
					{
						pub:false,
						identifier:"",
						title:""
					},options, true);
				
		opt.messages = $.extend({
					previous: "Previous",
					next: "Next",
					page: "Page",
					of: "of",
					required: "This field is required.",
					email: "Please enter a valid email address.",
					datemmddyyyy: "Please enter a valid date with this format(mm/dd/yyyy)",
					dateddmmyyyy: "Please enter a valid date with this format(dd/mm/yyyy)",
					number: "Please enter a valid number.",
					digits: "Please enter only digits.",
					maxlength: $.validator.format("Please enter no more than {0} characters"),
                    minlength: $.validator.format("Please enter at least {0} characters."),
                    equalTo: "Please enter the same value again.",
					max: $.validator.format("Please enter a value less than or equal to {0}."),
					min: $.validator.format("Please enter a value greater than or equal to {0}.")
			},opt.messages);
			
		opt.messages.max = $.validator.format(opt.messages.max);
		opt.messages.min = $.validator.format(opt.messages.min);
		
		$.extend($.validator.messages, opt.messages);
		
		var items = [];
		var reloadItemsPublic = function() 
			{
				$("#fieldlist"+opt.identifier).parents( 'form' ).addClass( theForm.formtemplate );
				for (var i=0, h = $.fbuilder.showSettings.formlayoutList.length; i<h; i++)
				{
					$("#fieldlist"+opt.identifier).removeClass($.fbuilder.showSettings.formlayoutList[i].id);
				}	
				$("#fieldlist"+opt.identifier).html("").addClass(theForm.formlayout);
				$("#formheader"+opt.identifier).html(theForm.show());
				
				var page = 0;
				$("#fieldlist"+opt.identifier).append('<div class="pb'+page+' pbreak" page="'+page+'"></div>');
				for (var i=0;i<items.length;i++)
				{
					items[i].index = i;
					if (items[i].ftype=="fPageBreak")
					{
						page++;
						$("#fieldlist"+opt.identifier).append('<div class="pb'+page+' pbreak" page="'+page+'"></div>');
					}
					else
					{
						$("#fieldlist"+opt.identifier+" .pb"+page).append(items[i].show());
						if (items[i].predefinedClick)
						{
                            $("#fieldlist"+opt.identifier+" .pb"+page).find("#"+items[i].name).attr("placeholder",items[i].predefined);
                            $("#fieldlist"+opt.identifier+" .pb"+page).find("#"+items[i].name).attr("value","");
                        }
						if (items[i].userhelpTooltip)
						{
							var uh = $("#fieldlist"+opt.identifier+" .pb"+page).find("#"+items[i].name).parents(".fields");
							uh.find(".uh").css("display","none");
							if (uh.find(".uh").text()!="")
							{
								uh.attr("uh",uh.find(".uh").text());
							}	
						}
					}
				}
				
				if (page>0)
				{
					$("#fieldlist"+opt.identifier+" .pb"+page).addClass("pbEnd");
					$("#fieldlist"+opt.identifier+" .pbreak").find(".field").addClass("ignorepb");
					$("#fieldlist"+opt.identifier+" .pb0").find(".field").removeClass("ignorepb");
					$("#fieldlist"+opt.identifier+" .pbreak").each(function(index) {
					
						var code = $(this).html();
						var bSubmit = '';
						
						if (index == page)
						{

							if ( $( "#cpcaptchalayer"+opt.identifier ).length && !/^\s*$/.test( $( "#cpcaptchalayer"+opt.identifier ).html() ) )
							{
								code += '<div class="captcha">'+$("#cpcaptchalayer"+opt.identifier).html()+'</div>';
								$("#cpcaptchalayer"+opt.identifier).html("");
							}
							if ($("#cp_subbtn"+opt.identifier).html())
							{
								bSubmit = '<div class="pbSubmit">'+$("#cp_subbtn"+opt.identifier).html()+'</div>';
							}	
						}
						$(this).html('<fieldset><legend>'+opt.messages.page+' '+(index+1)+' '+opt.messages.of+' '+(page+1)+'</legend>'+code+'<div class="pbPrevious">'+opt.messages.previous+'</div><div class="pbNext">'+opt.messages.next+'</div>'+bSubmit+'<div class="clearer"></div></fieldset>');
					});
					$( '#fieldlist'+opt.identifier).find(".pbPrevious,.pbNext").bind("click", { 'identifier' : opt.identifier }, function( evt ) {
					    var identifier = evt.data.identifier;
						if (  ($(this).hasClass("pbPrevious")) || (($(this).hasClass("pbNext")) && $(this).parents("form").valid())  )
						{
							var page = parseInt($(this).parents(".pbreak").attr("page"));
							
							(($(this).hasClass("pbPrevious"))?page--:page++);
							$("#fieldlist"+identifier+" .pbreak").css("display","none");
							$("#fieldlist"+identifier+" .pbreak").find(".field").addClass("ignorepb");

							$("#fieldlist"+identifier+" .pb"+page).css("display","block");
							$("#fieldlist"+identifier+" .pb"+page).find(".field").removeClass("ignorepb");
							if ($("#fieldlist"+identifier+" .pb"+page).find(".field").length>0)
							{
								try 
								{
									$("#fieldlist"+identifier+" .pb"+page).find(".field")[0].focus();
								} 
								catch(e){}
							}	
						}
						return false;
					});
				}
				else
				{
					if ( $( "#cpcaptchalayer"+opt.identifier ).length && !/^\s*$/.test( $( "#cpcaptchalayer"+opt.identifier ).html() ) )
					{
						$("#fieldlist"+opt.identifier+" .pb"+page).append('<div class="captcha">'+$("#cpcaptchalayer"+opt.identifier).html()+'</div>');
						$("#cpcaptchalayer"+opt.identifier).html("");
					}
					if ($("#cp_subbtn"+opt.identifier).html())
					{
						$("#fieldlist"+opt.identifier+" .pb"+page).append('<div class="pbSubmit">'+$("#cp_subbtn"+opt.identifier).html()+'</div>');
					}	
				}
				focusWithoutScrolling = function(el){
                  var x = window.scrollX, y = window.scrollY;
                  if( !/date/.test( el.id ) ) el.focus();
                  window.scrollTo(x, y);
                
                };
				focusWithoutScrolling($("#fieldlist"+opt.identifier+" .pb0").find(".field")[0]);			
				$( '#fieldlist'+opt.identifier).find(".pbSubmit").bind("click", { 'identifier' : opt.identifier }, function( evt ) 
					{
						$(this).parents("#fieldlist"+evt.data.identifier).parents("form").submit();
					});
				$("#fieldlist"+opt.identifier+" .predefinedClick").bind("click", function() 
					{
						if ($(this).attr("predefined") == $(this).val())
						{
							$(this).val("");
						}	
					});
				$("#fieldlist"+opt.identifier+" .predefinedClick").blur("click", function() 
					{
						if ($(this).val()=="")
						{
							$(this).val($(this).attr("predefined"));
						}	
					});

				if (i>0)
				{
					for (var i=0;i<items.length;i++)
					{
						items[i].after_show();
					}	
					
					$.fbuilder.showHideDep(
						{
							'formIdentifier' : opt.identifier, 
							'throwEvent'	 : true
						}	
					);
					
					$( '#fieldlist'+opt.identifier).find(".depItemSel,.depItem").bind("change", { 'identifier' : opt.identifier }, function( evt ) 
						{
							$.fbuilder.showHideDep(
								{
									'formIdentifier' : evt.data.identifier, 
									'throwEvent'	 : true
								}	
							);
						});
					try 
					{
						$( "#fbuilder"+opt.identifier ).tooltip({show: false,hide:false,tooltipClass:"uh-tooltip",position: { my: "left top", at: "left bottom", collision: "none"  },items: "[uh]",content: function (){return $(this).attr("uh");} });
					} catch(e){}

				}
			};
			
		var fform=function(){};
		$.extend(fform.prototype,
			{
				title:"Untitled Form",
				description:"This is my form. Please fill it out. It's awesome!",
				formlayout:"top_aligned",
				formtemplate:"",
				show:function(){
					return '<div class="fform" id="field"><h1>'+this.title+'</h1><span>'+this.description+'</span></div>';
				}
			});
		
		//var theForm = new fform(),
		var theForm,
			ffunct = {
				getItem: function( name )
					{
						for( var i in items )
						{
							if( items[ i ].name == name )
							{
								return items[ i ];
							}
						}
						return false;
					},
				getItems: function() 
					{
					   return items;
					},
				loadData:function(f)
					{
						var d,
							e = $("#"+f);
						
						this.formId = e.parents( 'form' ).attr( 'id' );
						if ( d = $.parseJSON( e.val() ))
						{
						   if (d.length==2)
						   {
							   items = [];
							   for (var i=0;i<d[0].length;i++)
							   {
								   var obj = eval("new $.fbuilder.controls['"+d[0][i].ftype+"']();");
								   obj = $.extend(true, {}, obj,d[0][i]);
								   obj.name = obj.name+opt.identifier;
								   obj.form_identifier = opt.identifier;
								   items[items.length] = obj;
							   }
							   theForm = new fform();
							   theForm = $.extend(theForm,d[1][0]);
							   reloadItemsPublic();
						   }
						}
					}
			};

		$.fbuilder[ 'forms' ][ opt.identifier ] = ffunct;
	    this.fBuild = ffunct;
	    return this;
	}; // End fbuilder plugin

	$.fbuilder[ 'showSettings' ] = {
		formlayoutList : [{id:"top_aligned",name:"Top Aligned"},{id:"left_aligned",name:"Left Aligned"},{id:"right_aligned",name:"Right Aligned"}]
	};
	
	$.fbuilder.controls[ 'ffields' ] = function(){};
	$.extend($.fbuilder.controls[ 'ffields' ].prototype, 
		{
				form_identifier:"",
				name:"",
				shortlabel:"",
				index:-1,
				ftype:"",
				userhelp:"",
				userhelpTooltip:false,
				csslayout:"",
				init:function(){},
				show:function()
					{
						return 'Not available yet';
					},
				after_show:function(){},
				val:function(){
					var e = $( "[id='" + this.name + "']:not(.ignore)" );
					if( e.length )
					{
						return $.fbuilder.parseVal( $.trim( e.val() ) );
					}
					return 0;
				}
		});
	
	$.fbuilder[ 'showHideDep' ] = function( configObj )
		{
			if( typeof configObj[ 'formIdentifier' ] !== 'undefined' )
			{
				var identifier = configObj[ 'formIdentifier' ];
				
				if( typeof  $.fbuilder[ 'forms' ][ identifier ] != 'undefined' )
				{
					var toShow = [],
						toHide = [],
						items = $.fbuilder[ 'forms' ][ identifier ].getItems();
						
					for( var i = 0, h = items.length; i < h; i++ )
					{
						if( typeof items[ i ][ 'showHideDep' ] != 'undefined' )
						{
							items[ i ][ 'showHideDep' ]( toShow, toHide );
						}
					}
					
					if( typeof configObj[ 'throwEvent' ] == 'undefined' || configObj[ 'throwEvent' ] )
					{
						$( document ).trigger( 'showHideDepEvent', $.fbuilder[ 'forms' ][ identifier ][ 'formId' ] );
					}	
				}
			}	
		}; // End showHideDep	
			$.fbuilder.controls[ 'ftext' ]=function(){};
	$.extend(
		$.fbuilder.controls[ 'ftext' ].prototype,
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Untitled",
			ftype:"ftext",
			predefined:"",
			predefinedClick:false,
			required:false,
			size:"medium",
			minlength:"",
			maxlength:"",
			equalTo:"",
			show:function()
				{
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><input id="'+this.name+'" name="'+this.name+'" minlength="'+(this.minlength)+'" maxlength="'+$.fbuilder.htmlEncode(this.maxlength)+'" '+((this.equalTo!="")?"equalTo=\"#"+$.fbuilder.htmlEncode(this.equalTo+this.form_identifier)+"\"":"" )+' class="field '+this.size+((this.required)?" required":"")+'" type="text" value="'+$.fbuilder.htmlEncode(this.predefined)+'"/><span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				}
		}	
	);	$.fbuilder.controls[ 'fcurrency' ] = function(){};
	$.extend( 
		$.fbuilder.controls[ 'fcurrency' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Currency",
			ftype:"fcurrency",
			predefined:"",
			predefinedClick:false,
			required:false,
			size:"small",
			readonly:false,
			currencyText:"USD",
			thousandSeparator:",",
			centSeparator:".",
			formatDynamically:false,

			getFormattedValue:function( value )
				{
					this.centSeparator = $.trim(this.centSeparator);	
					if( /^\s*$/.test( this.centSeparator ) )
					{
						this.centSeparator = '.';
					}
					var v = $.trim( value );
					v = v.replace( new RegExp( $.fbuilder[ 'escape_symbol' ](this.currencySymbol), 'g' ), '' )
						 .replace( new RegExp( $.fbuilder[ 'escape_symbol' ](this.currencyText), 'g' ), '' );
					v = $.fbuilder.parseVal( v, this.thousandSeparator, this.centSeparator );	 
					if( !isNaN( v ) )
					{
						v = v.toString();
						var parts = v.toString().split("."),
							counter = 0,
							str = '';
								
						if( !/^\s*$/.test( this.thousandSeparator ) )
						{
							for( var i = parts[0].length-1; i >= 0; i--){
								counter++;
								str = parts[0][i] + str;
								if( counter%3 == 0 && i != 0 ) str = this.thousandSeparator + str;

							}
							parts[0] = str;
						}
						if( typeof parts[ 1 ] != 'undefined' && parts[ 1 ].length == 1 )
						{
							parts[ 1 ] += '0';
						}
						if( /^\s*$/.test( this.centSeparator ) )
						{
							this.centSeparator = '.';
						}
						return this.currencySymbol+parts.join( this.centSeparator )+this.currencyText;
					}
					else
					{
						return value;
					}
				},	
			
			show:function()
				{
					if( this.formatDynamically )
					{

						var me = this;
						$( document ).on( 'change', '[name="' + this.name + '"]', function(){
							this.value = me.getFormattedValue( this.value );
						} );
					}

					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><input '+(( this.readonly )? 'READONLY' : '' )+' id="'+this.name+'" name="'+this.name+'" class="field '+this.dformat+' '+this.size+((this.required)?" required":"")+'" type="text" value="'+$.fbuilder.htmlEncode( this.getFormattedValue( this.predefined ) )+'"/><span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				},
			val:function()
				{
					var e = $( '[id="' + this.name + '"]:not(.ignore)' );
					if( e.length )
					{
						var v = $.trim( e.val() );
						
						v = v.replace( new RegExp( $.fbuilder[ 'escape_symbol' ](this.currencySymbol), 'g' ), '' )
						     .replace( new RegExp( $.fbuilder[ 'escape_symbol' ](this.currencyText), 'g' ), '' );
						
						return $.fbuilder.parseVal( v, this.thousandSeparator, this.centSeparator );	 
					}
					return 0;
				}	
		}
	);	$.fbuilder.controls[ 'fnumber' ] = function(){};
	$.extend( 
		$.fbuilder.controls[ 'fnumber' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Number",
			ftype:"fnumber",
			predefined:"",
			predefinedClick:false,
			required:false,
			size:"small",
			thousandSeparator:"",
			decimalSymbol:".",
			min:"",
			max:"",
			dformat:"digits",
			formats:new Array("digits","number"),
			show:function()
				{
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><input id="'+this.name+'" name="'+this.name+'"'+( ( !/^\s*$/.test( this.min) ) ? 'min="'+$.fbuilder.parseVal( this.min, this.thousandSeparator, this.decimalSymbol )+'" ' : '' )+( ( !/^\s*$/.test( this.max) ) ? ' max="'+$.fbuilder.parseVal( this.max, this.thousandSeparator, this.decimalSymbol )+'" ' : '' )+' class="field '+this.dformat+' '+this.size+((this.required)?" required":"")+'" type="text" value="'+$.fbuilder.htmlEncode(this.predefined)+'"/><span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				},
			after_show:function()
				{
					if( typeof $[ 'validator' ] != 'undefined' )
					{
						$.validator.addMethod( 'number', function( value, element )
										{
                                            var sf = element.id.match( /_\d+$/)[ 0 ],
                                                e = $.fbuilder[ 'forms' ][ element.id.match( /_\d+$/)[ 0 ] ].getItem( element.name ),
                                                thousandSeparator = ( typeof e.thousandSeparator != 'undefined' ) ? e.thousandSeparator : '',
                                                decimalSymbol = ( typeof e.decimalSymbol != 'undefined' && $.trim( e.decimalSymbol ) ) ? e.decimalSymbol : '.';
                                                
											var regExp = new RegExp( '^-?(?:\\d+|\\d{1,3}(?:' + $.fbuilder.escape_symbol( thousandSeparator ) + '\\d{3})+)?(?:' + $.fbuilder.escape_symbol( decimalSymbol ) + '\\d+)?$' );

											return this.optional(element) || regExp.test( value );
										}
						);
						
						$.validator.addMethod( 'min', function( value, element, param ) 
                                        {
                                            var sf = element.id.match( /_\d+$/)[ 0 ],
                                                e = $.fbuilder[ 'forms' ][ element.id.match( /_\d+$/)[ 0 ] ].getItem( element.name ),
                                                thousandSeparator = ( typeof e.thousandSeparator != 'undefined' ) ? e.thousandSeparator : '',
                                                decimalSymbol = ( typeof e.decimalSymbol != 'undefined' && $.trim( e.decimalSymbol ) ) ? e.decimalSymbol : '.';
                                                
											return this.optional(element) || $.fbuilder.parseVal( value, thousandSeparator, decimalSymbol ) >= param;
                                        }
						);

						$.validator.addMethod( 'max', function( value, element, param ) 
                                        {
                                            var sf = element.id.match( /_\d+$/)[ 0 ],
                                                e = $.fbuilder[ 'forms' ][ element.id.match( /_\d+$/)[ 0 ] ].getItem( element.name ),
                                                thousandSeparator = ( typeof e.thousandSeparator != 'undefined' ) ? e.thousandSeparator : '',
                                                decimalSymbol = ( typeof e.decimalSymbol != 'undefined' && $.trim( e.decimalSymbol ) ) ? e.decimalSymbol : '.';
                                                
											return this.optional(element) || $.fbuilder.parseVal( value, thousandSeparator, decimalSymbol ) <= param;
                                        }
						);
						
					}
				},
			val:function()
				{
					var e = $( '[id="' + this.name + '"]:not(.ignore)' );
					if( e.length )
					{
						var v = $.trim( e.val() );
						return $.fbuilder.parseVal( v, this.thousandSeparator, this.decimalSymbol );	 
					}
					return 0;
				}		
		}
	);	$.fbuilder.controls[ 'femail' ] = function(){};
	$.extend( 
		$.fbuilder.controls[ 'femail' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Email",
			ftype:"femail",
			predefined:"",
			predefinedClick:false,
			required:false,
			size:"medium",
			equalTo:"",
			show:function()
				{
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><input id="'+this.name+'" name="'+this.name+'" '+((this.equalTo!="")?"equalTo=\"#"+$.fbuilder.htmlEncode(this.equalTo+this.form_identifier)+"\"":"" )+' class="field email '+this.size+((this.required)?" required":"")+'" type="text" value="'+$.fbuilder.htmlEncode(this.predefined)+'"/><span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				}
		}
	);	$.fbuilder.controls[ 'fdate' ] = function(){};
	$.extend(
		$.fbuilder.controls[ 'fdate' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Date",
			ftype:"fdate",
			predefined:"",
			predefinedClick:false,
			size:"medium",
			required:false,
			dformat:"mm/dd/yyyy",
			showDropdown:false,
			dropdownRange:"-10:+10",
			minDate:"",
			maxDate:"",
            invalidDates:"",
			minHour:0,
			maxHour:23,
			minMinute:0,
			maxMinute:59,
			
			stepHour: 1,
			stepMinute: 1,
			
			showTimepicker: false,
			
			defaultDate:"",
			defaultTime:"",
			working_dates:[true,true,true,true,true,true,true],
			formats:new Array("mm/dd/yyyy","dd/mm/yyyy"),
			init:function()
				{
					function checkValue( v, min, max )
						{
							v = parseInt( v );
							if( isNaN( v ) )   v = max;
							else if( v < min ) v = min;
							else if( v > max ) v = max;
							return v;
						}
						
					this.minHour 	= checkValue( this.minHour, 0, 23 );
					this.maxHour 	= checkValue( this.maxHour, 0, 23 );
					this.minMinute 	= checkValue( this.minMinute, 0, 59 );
					this.maxMinute 	= checkValue( this.maxMinute, 0, 59 );
					this.stepHour 	= checkValue( this.stepHour, 1, Math.max( 1, this.maxHour - this.minHour ) );
					this.stepMinute = checkValue( this.stepMinute, 1, Math.max( 1, this.maxMinute - this.minMinute ) );
                    
                    this.invalidDates = this.invalidDates.replace( /\s+/g, '').match( /\d{1,2}\/\d{1,2}\/\d{4}/g );
                    if( this.invalidDates !== null )
                    {
                        for( var i = 0, h = this.invalidDates.length; i < h; i++ )
                            this.invalidDates[ i ] = new Date( this.invalidDates[ i ] );
                    }
                },
			get_hours:function()
				{
					var str = '',
						i = 0,
						h;
					
					while( ( h = this.minHour + this.stepHour * i ) <= this.maxHour )
					{
						if( h < 10 )
						{
							h = '0'+''+h;
						}
						str += '<option value="' + h + '">' + h + '</option>';
						i++;
					}
					return ' ( <select id="'+this.name+'_hours" name="'+this.name+'_hours">' + str + '</select>:';
				},
			get_minutes:function()
				{
					var str = '',
						i = 0,
						m;
					
					while( ( m = this.minMinute + this.stepMinute * i ) <= this.maxMinute )
					{
						if( m < 10 )
						{
							m = '0'+''+m;
						}
						str += '<option value="' + m + '">' + m + '</option>';
						i++;
					}
					return '<select id="'+this.name+'_minutes" name="'+this.name+'_minutes">' + str + '</select> )';
				},
			set_date_time:function()
				{
					var str = $( '#'+this.name+'_date' ).val();
					if( this.showTimepicker )
					{
						str += ' '+$( '#'+this.name+'_hours' ).val()+':'+$( '#'+this.name+'_minutes' ).val();
					}
					$( '#'+this.name ).val( str ).change();
				},
			show:function()
				{
                    this.init();
                    
                    var attr = 'value';
                    if( this.predefinedClick )
                    {
                        attr = 'placeholder';
                    }
                    
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+' <span class="dformat">('+this.dformat+( ( this.showTimepicker ) ? ' HH:mm': '' )+')</span></label><div class="dfield"><input id="'+this.name+'" name="'+this.name+'" type="hidden" value="'+$.fbuilder.htmlEncode(this.predefined)+'"/><input id="'+this.name+'_date" name="'+this.name+'_date" class="field date'+this.dformat.replace(/\//g,"")+' '+this.size+((this.required)?" required":"")+'" type="text" '+attr+'="'+$.fbuilder.htmlEncode(this.predefined)+'"/>'+( ( this.showTimepicker ) ? this.get_hours()+this.get_minutes() : '' )+'<span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				},
			setEvents : function()
				{
					var me = this;
					$( document ).on( 'change', '#'+this.name+'_date', 	  function(){ me.set_date_time(); } );
					$( document ).on( 'change', '#'+this.name+'_hours',   function(){ me.set_date_time(); } );
					$( document ).on( 'change', '#'+this.name+'_minutes', function(){ me.set_date_time(); } );
				},
			after_show:function()
				{
					function setValue( f, v, m )
					{
						f = '#'+f+' option';
						v = ( ( v+'' ).length == 1 ) ? '0'+v : v;
						m = ( ( m+'' ).length == 1 ) ? '0'+m : m;
						
						$( f ).each( function(){
							var t = $( this ).attr( 'value' );
							if( v <= t )
							{
								v = t;
								return false; 
							}
						} );
						$( f+'[value="' + ( ( v < m ) ? v : m ) + '"]' ).attr( 'selected', true );
					};
					
                    function validateDate( d, w, i )
                    {
                        try{
                            if( d === null ) return [false,""];
                            if ( ! w[ d.getDay()]) return [false,""];
                            if( i !== null )
                            {
                                for( var j = 0, h = i.length; j < h; j++ )
                                {
                                    if( d.getDate() == i[ j ].getDate() && d.getMonth() == i[ j ].getMonth() && d.getFullYear() == i[ j ].getFullYear() ) return [false,""];
                                }
                            }
                        }
                        catch( _err ){}
                        return [true,""]; 
                    };
                    
                    function validator( v, e )
                    {
                        try
                        {
                            var p           = e.name.replace( '_date', '' ).split( '_' ),
                                item        = $.fbuilder[ 'forms' ][ '_'+p[ 1 ] ].getItem( p[ 0 ]+'_'+p[ 1 ] ),
                                inst        = $.datepicker._getInst( e ),
                                minDate     = $.datepicker._determineDate( inst, $.datepicker._get( inst, 'minDate'), null),
                                maxDate     = $.datepicker._determineDate(inst, $.datepicker._get(inst, 'maxDate'), null),
                                dateFormat  = $.datepicker._get(inst, 'dateFormat'),
                                date        = $.datepicker.parseDate(dateFormat, v, $.datepicker._getFormatConfig(inst));

                            return this.optional( e ) || ( ( minDate == null || date >= minDate  ) && ( maxDate == null || date <= maxDate ) && validateDate( $( e ).datepicker( 'getDate' ), item.working_dates, item.invalidDates )[ 0 ] );
                        }
                        catch( er )
                        {
                            return false;
                        }
                    };
                    
					this.setEvents();
					var p  = { 
							dateFormat: this.dformat.replace(/yyyy/g,"yy"),
							minDate: this.minDate,
							maxDate: this.maxDate
						},
						dp = $( "#"+this.name+"_date" ),
						dd = (this.defaultDate != "") ? this.defaultDate : ( ( this.predefined != "" ) ? this.predefined : new Date() );

					dp.click( function(){ $(document).click(); $(this).focus(); } );	
					if (this.showDropdown) p = $.extend(p,{changeMonth: true,changeYear: true,yearRange: this.dropdownRange});
					p = $.extend(p, { beforeShowDay: ( function ( w, i ) { return function( d ){ return validateDate( d, w, i ); }; } )( this.working_dates, this.invalidDates ) } );
					dp.datepicker(p);
                    if( !this.predefinedClick ) dp.datepicker( "setDate", dd);
                    if( !validateDate( dp.datepicker( "getDate"), this.working_dates, this.invalidDates)[ 0 ]  )
                    {    
                        dp.datepicker( "setDate", '');
                    }
					
					if( this.showTimepicker )
					{
						var parts, time = {}, tmp = 0;
						if(  ( parts = /(\d{1,2}):(\d{1,2})/g.exec( this.defaultTime ) ) != null )
						{
							time[ 'hour' ] = parts[ 1 ];
							time[ 'minute' ] = parts[ 2 ];
						}
						else
						{
							var d = new Date();
							time[ 'hour' ] = d.getHours();
							time[ 'minute' ] = d.getMinutes();
						}
						
						setValue( this.name+'_hours', time[ 'hour' ], this.maxHour );
						setValue( this.name+'_minutes', time[ 'minute' ], this.maxMinute );
					}
					
					$( '#'+this.name+'_date' ).change();
                    
                    $.validator.addMethod("dateddmmyyyy", validator );
					$.validator.addMethod("datemmddyyyy", validator );
				},
			val:function()
				{

					var e = $( '[id="' + this.name + '"]:not(.ignore)' );
					if( e.length )
					{
						var v = $.trim( e.val() ),
							d = /(\d{1,2})\/(\d{1,2})\/(\d{4})(\s(\d{1,2}):(\d{1,2}))?/.exec( v ),
							h = 0,
							m = 0;
												
						if( d )
						{
							if( typeof d[ 5 ] != 'undefined' ) h = d[ 5 ];
							if( typeof d[ 6 ] != 'undefined' ) m = d[ 6 ];
							
							var date = ( this.dformat == 'mm/dd/yyyy' ) ? new Date( d[ 3 ], ( d[ 1 ] * 1 - 1 ), d[ 2 ], h, m, 0, 0 ) : new Date( d[ 3 ], ( d[ 2 ] * 1 - 1 ), d[ 1 ], h, m, 0, 0 );

							if( this.showTimepicker )
							{
								return date.valueOf() / 86400000;
							}
							else
							{
								return Math.ceil( date.valueOf() / 86400000 );
							}
						}	
					}
					return 0;
				}
		}
	);	$.fbuilder.controls[ 'ftextarea' ] = function(){};
	$.extend(
		$.fbuilder.controls[ 'ftextarea' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Untitled",
			ftype:"ftextarea",
			predefined:"",
			predefinedClick:false,
			required:false,
			size:"medium",
			minlength:"",
			maxlength:"",
			show:function()
				{
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><textarea id="'+this.name+'" name="'+this.name+'" minlength="'+(this.minlength)+'" maxlength="'+$.fbuilder.htmlEncode(this.maxlength)+'" class="field '+this.size+((this.required)?" required":"")+'">'+this.predefined+'</textarea><span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				}
		}
	);	$.fbuilder.controls[ 'fcheck' ]=function(){};
	$.extend(
		$.fbuilder.controls[ 'fcheck' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Check All That Apply",
			ftype:"fcheck",
			layout:"one_column",
			required:false,
			showDep:false,
			init:function()
				{
					this.choices = new Array("First Choice","Second Choice","Third Choice");
					this.choicesVal = new Array("First Choice","Second Choice","Third Choice");
					this.choiceSelected = new Array(false,false,false);
					this.choicesDep = new Array(new Array(),new Array(),new Array());
				},
			show:function()
				{
					this.choicesVal = ((typeof(this.choicesVal) != "undefined" && this.choicesVal !== null)?this.choicesVal:this.choices.slice(0));
					var str = "";
					if (!(typeof(this.choicesDep) != "undefined" && this.choicesDep !== null))
					{
						this.choicesDep = new Array();
						for (var i=0;i<this.choices.length;i++)
						{
							this.choicesDep[i] = new Array();
						}	
					}
					for (var i=0;i<this.choices.length;i++)
					{
						var classDep = "",
							attrDep = "",
							separator = "",
							d = this.choicesDep[ i ];

						for (var j=0;j<d.length;j++)
						{
							if( !/^\s*$/.test( d[j] ) )
							{
								classDep = "depItem";
								attrDep += separator+d[j];
								separator = ",";
							}	
						}
						
						str += '<div class="'+this.layout+'"><label><input name="'+this.name+'[]" '+((classDep!="")?"dep=\""+attrDep+"\"":"")+' id="'+this.name+'" class="field '+classDep+' group '+((this.required)?" required":"")+'" value="'+$.fbuilder.htmlEncode(this.choicesVal[i])+'" vt="'+$.fbuilder.htmlEncode(this.choices[i])+'" type="checkbox" '+((this.choiceSelected[i])?"checked":"")+'/> '+this.choices[i]+'</label></div>';
					}
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label>'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield">'+str+'<span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				},
			showHideDep:function( toShow, toHide )
				{
					var item = $( '#'+this.name+'.depItem' ),
						form_identifier = this.form_identifier;
						
					try
					{
						if( item.length )
						{
							var parent = item.closest( '.fields' );
							parent.find( '.field' ).each( function()
							{
								var item = $( this );

								if(  item.attr( 'dep' ) && item.attr( 'dep' ) != '' )
								{
									var d = item.attr( 'dep' ).split( ',' );
									for ( i=0; i<d.length; i++ )
									{
										if ( d[i] != "" )
										{
											d[i] = d[i] + form_identifier;
											if ( $.inArray( d[i], toShow ) == -1 )
											{
												try 
												{
													if ( item.is( ':checked' ) && $.inArray( item.attr( 'id' ), toHide ) == -1  )
													{
														$( '#'+d[i] ).closest( '.fields' ).css( 'display', '' );
														$( '#'+d[i] ).closest( '.fields' ).find( '.field' ).each( function(){
																$(this).removeClass( 'ignore' );
															});
															
														if( $.inArray( d[i], toShow ) == -1 )
														{
															toShow[toShow.length] = d[i];
														}
														
														var index = $.inArray( d[ i ], toHide );
														if( index != -1 )
														{
															toHide.splice( index, 1);
														}	
													}
													else
													{
														$( '#' + d[i] ).closest( '.fields' ).css( 'display', 'none' );
														$( '#' + d[i] ).closest( '.fields' ).find( '.field' ).each(function()
															{
																$(this).addClass('ignore');
															});
															
														if( $.inArray( d[i], toHide ) == -1 )
														{
															toHide[ toHide.length ] = d[ i ];
														}	
													}
												} catch(e){  }
											}
										}	
										
									}
								}
							});
						}
					}
					catch( e ){  }
				},
			val:function()
				{
					var e = $( '[id="' + this.name + '"]:checked:not(.ignore)' ),
						v = 0,
						me = this;
						
					if( e.length )
					{
						e.each( function(){
							v += $.fbuilder.parseVal( this.value );
						} );
					}
					return v;	
				}
		}
	);	$.fbuilder.controls[ 'fradio' ]=function(){};
	$.extend(
		$.fbuilder.controls[ 'fradio' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Select a Choice",
			ftype:"fradio",
			layout:"one_column",
			required:false,
			choiceSelected:"",
			showDep:false,
			init:function()
				{
					this.choices = new Array("First Choice","Second Choice","Third Choice");
					this.choicesVal = new Array("First Choice","Second Choice","Third Choice");
					this.choicesDep = new Array(new Array(),new Array(),new Array());
				},
			show:function()
				{
					this.choicesVal = ((typeof(this.choicesVal) != "undefined" && this.choicesVal !== null)?this.choicesVal:this.choices.slice(0));
					var str = "";

					if (!(typeof(this.choicesDep) != "undefined" && this.choicesDep !== null))
					{
						this.choicesDep = new Array();
						for (var i=0;i<this.choices.length;i++)
						{
							this.choicesDep[i] = new Array();
						}	
					}
					var classDep = "";
					for (var i=0, h = this.choicesDep.length;i<h;i++)
					{
						if( this.choicesDep[i].length )
						{
							classDep = "depItem";
							break;
						}
					}
					for (var i=0;i<this.choices.length;i++)
					{
						var attrDep = "",
							separator = "",
							d = this.choicesDep[ i ];
							
						for (var j=0;j<d.length;j++)
						{
							if( !/^\s*$/.test( d[j] ) )
							{
								attrDep += separator+d[j];
								separator = ",";
							}	
						}
						
						str += '<div class="'+this.layout+'"><label><input name="'+this.name+'" id="'+this.name+'" '+((attrDep!="")?"dep=\""+attrDep+"\"":"")+' class="field '+classDep+' group '+((this.required)?" required":"")+'" value="'+$.fbuilder.htmlEncode(this.choicesVal[i])+'" vt="'+$.fbuilder.htmlEncode(this.choices[i])+'" type="radio" i="'+i+'"  '+((this.choices[i]+' - '+this.choicesVal[i]==this.choiceSelected)?"checked":"")+'/> '+this.choices[i]+'</label></div>';
					}
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label>'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield">'+str+'<span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				},
			showHideDep:function( toShow, toHide )
				{
					var item = $( '#'+this.name+'.depItem' ),
						form_identifier = this.form_identifier;
						
					try
					{

						if( item.length )
						{
							var parent = item.closest( '.fields' );
							parent.find( '.field' ).each( function()
							{

								var item = $( this );
	

								if(  item.attr( 'dep' ) && item.attr( 'dep' ) != '' )
								{
									var d = item.attr( 'dep' ).split( ',' );
									for ( i=0; i<d.length; i++ )
									{
										if ( d[i] != "" )
										{
											d[i] = d[i] + form_identifier;
											if ( $.inArray( d[i], toShow ) == -1 )
											{
												try 
												{
													if ( item.is( ':checked' ) && $.inArray( item.attr( 'id' ), toHide ) == -1 )
													{
														$( '#'+d[i] ).closest( '.fields' ).css( 'display', '' );
														$( '#'+d[i] ).closest( '.fields' ).find( '.field' ).each( function(){
																$(this).removeClass( 'ignore' );
															});
															
														if( $.inArray( d[i], toShow ) == -1 )
														{
															toShow[toShow.length] = d[i];
														}	
														
														var index = $.inArray( d[ i ], toHide );
														if( index != -1 )
														{
															toHide.splice( index, 1);
														}	
													}
													else
													{
														$( '#' + d[i] ).closest( '.fields' ).css( 'display', 'none' );
														$( '#' + d[i] ).closest( '.fields' ).find( '.field' ).each(function()
															{
																$(this).addClass("ignore");
															});
														
														if( $.inArray( d[i], toHide ) == -1 )
														{
															toHide[ toHide.length ] = d[ i ];
														}	
													}
												} catch(e){  }
											}
										}	
										
									}
								}
							});
						}
					}
					catch( e ){  }
				},
			val:function()
				{
					var e = $( '[id="' + this.name + '"]:checked:not(.ignore)' );
					if( e.length )
					{
						return $.fbuilder.parseVal( e.val() );
					}
					return 0;	
				}	
		}
	);	$.fbuilder.controls[ 'fdropdown' ]=function(){};
	$.extend(
		$.fbuilder.controls[ 'fdropdown' ].prototype,
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Select a Choice",
			ftype:"fdropdown",
			size:"medium",
			required:false,
			choiceSelected:"",
			showDep:false,
			init:function()
				{
					this.choices = new Array("First Choice","Second Choice","Third Choice");
					this.choicesVal = new Array("First Choice","Second Choice","Third Choice");
					this.choicesDep = new Array(new Array(),new Array(),new Array());
				},
			show:function()
				{
					this.choicesVal = ((typeof(this.choicesVal) != "undefined" && this.choicesVal !== null)?this.choicesVal:this.choices.slice(0))
					
					var lv = this.choicesVal,
						l = this.choices,
						str = "";
						
					if (!(typeof(this.choicesDep) != "undefined" && this.choicesDep !== null))
					{
						this.choicesDep = new Array();
						for (var i=0;i<l.length;i++)
						{
							this.choicesDep[i] = new Array();
						}	
					}
					var classDep = "";
					for (var i=0, h = this.choicesDep.length;i<h;i++)
					{
						if( this.choicesDep[i].length )
						{
							classDep = "depItem";
							break;
						}
					}
					for (var i=0;i<l.length;i++)
					{
						var attrDep = "",
							separator = "",
							d = this.choicesDep[ i ];
							
						for (var j=0;j<d.length;j++)
						{
							if( !/^\s*$/.test( d[j] ) )
							{
								attrDep += separator+d[j];
								separator = ",";
							}	
						}
						
						str += '<option '+((attrDep!="")?"dep=\""+attrDep+"\"":"")+' '+((this.choiceSelected == l[i]+' - '+lv[i])?"selected":"")+' '+( ( classDep != '' ) ? 'class="'+classDep+'"' : '' )+' value="'+$.fbuilder.htmlEncode(lv[i])+'" vt="'+$.fbuilder.htmlEncode(l[i])+'" >'+l[i]+'</option>';
					}
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><select id="'+this.name+'" name="'+this.name+'" class="field '+( ( classDep != '' ) ? ' depItemSel ' : '' )+this.size+((this.required)?" required":"")+'" >'+str+'</select><span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div><div class="clearer"></div></div>';
				},
			showHideDep:function( toShow, toHide )
				{
					var item = $( '#'+this.name ),
						form_identifier = this.form_identifier;
		
					try
					{
						if( item.find( '.depItem' ).length )
						{
							var id = item.attr( 'id' );
							item.find( '.depItem' ).each( function()
								{
									var item = $( this );
									if( item.attr( 'dep' ) && item.attr( 'dep' ) != '' )
									{
										var d = item.attr( 'dep' ).split( ',' );
										for ( i=0; i<d.length; i++ )
										{
											if ( d[i] != "" )
											{
												d[i] = d[i] + form_identifier;
												if ( $.inArray( d[i], toShow ) == -1 )
												{
													try 
													{
														if ( item.is( ':selected' ) && $.inArray( id, toHide ) == -1  )
														{
															$( '#'+d[i] ).closest( '.fields' ).css( 'display', '' );
															$( '#'+d[i] ).closest( '.fields' ).find( '.field' ).each( function(){
																	$(this).removeClass( 'ignore' );
																});
																
															if( $.inArray( d[i], toShow ) == -1 )
															{
																toShow[toShow.length] = d[i];
															}
															
															var index = $.inArray( d[ i ], toHide );
															if( index != -1 )
															{
																toHide.splice( index, 1);
															}	
														}
														else
														{
															$( '#' + d[i] ).closest( '.fields' ).css( 'display', 'none' );
															$( '#' + d[i] ).closest( '.fields' ).find( '.field' ).each(function()
																{
																	$(this).addClass("ignore");
																});
																
															if( $.inArray( d[i], toHide ) == -1 )
															{
																toHide[ toHide.length ] = d[ i ];
															}	
														}
													} catch(e){}
												}
											}	
										}
									}
								});
						}
					}
					catch( e ){}					
				}	
		}
	);	$.fbuilder.controls[ 'ffile' ] = function(){};
	$.extend( 
		$.fbuilder.controls[ 'ffile' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Untitled",
			ftype:"ffile",
			required:false,
			size:"medium",
			accept:"",
			upload_size:"",
			show:function()
				{
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><input type="file" id="'+this.name+'" name="'+this.name+'" accept="'+this.accept+'" upload_size="'+this.upload_size+'" class="field '+this.size+((this.required)?" required":"")+'" /><span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				},
			after_show:function()
			{
                $.validator.addMethod("upload_size", function(value, element,params) 
			    {
			      return this.optional(element) || (element.files[0].size/1024 < params);
			    });
			}	  
		}         
	);            
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  
                  	$.fbuilder.controls[ 'fpassword' ] = function(){};
	$.extend( 
		$.fbuilder.controls[ 'fpassword' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Untitled",
			ftype:"fpassword",
			predefined:"",
			predefinedClick:false,
			required:false,
			size:"medium",
			minlength:"",
			maxlength:"",
			equalTo:"",
			show:function()
				{
					return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><input id="'+this.name+'" name="'+this.name+'" minlength="'+(this.minlength)+'" maxlength="'+$.fbuilder.htmlEncode(this.maxlength)+'" '+((this.equalTo!="")?"equalTo=\"#"+$.fbuilder.htmlEncode(this.equalTo+this.form_identifier)+"\"":"" )+' class="field '+this.size+((this.required)?" required":"")+'" type="password" value="'+$.fbuilder.htmlEncode(this.predefined)+'"/><span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
				}
		}
	);	$.fbuilder.controls[ 'fPhone' ]=function(){};
	$.extend( 
		$.fbuilder.controls[ 'fPhone' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Phone",
			ftype:"fPhone",
			required:false,
			dformat:"### ### ####",
			predefined:"888 888 8888",
			show:function()
			{
				var me   = this,
					str  = "",
					tmp  = this.dformat.split(' '),
					tmpv = this.predefined.split(' '),
                    attr = ( typeof this.predefinedClick != 'undefined' && this.predefinedClick ) ? 'placeholder' : 'value';
					
				for (var i=0;i<tmpv.length;i++)
				{
					if ($.trim(tmpv[i])=="")
					{
						tmpv.splice(i,1);
					}
				}	
                
				for (var i=0;i<tmp.length;i++)
				{
					if ($.trim(tmp[i])!="")
					{
                        str += '<div class="uh_phone" ><input type="text" id="'+this.name+'_'+i+'" name="'+this.name+'_'+i+'" class="field digits '+((this.required)?" required":"")+'" style="width:'+(15*$.trim(tmp[i]).length)+'px" '+attr+'="'+((tmpv[i])?tmpv[i]:"")+'" maxlength="'+$.trim(tmp[i]).length+'" minlength="'+$.trim(tmp[i]).length+'"/><div class="l">'+$.trim(tmp[i])+'</div></div>';
					}
				}	
				
				return '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><label for="'+this.name+'">'+this.title+''+((this.required)?"<span class='r'>*</span>":"")+'</label><div class="dfield"><input type="hidden" id="'+this.name+'" name="'+this.name+'" class="field " />'+str+'<span class="uh">'+this.userhelp+'</span></div><div class="clearer"></div></div>';
			},
            after_show: function()
            {
                var me   = this,
                    tmp  = me.dformat.split(' ');
                
                for (var i = 0, h = tmp.length; i < h; i++ )
				{
					$( '#'+me.name+'_'+i ).bind( 'change', function(){ 
						var v = '';
						for( var i = 0; i < tmp.length; i++ )
						{
							v += $( '#'+me.name+'_'+i ).val();
						}
						$( '#'+me.name ).val( v ).change();
					} );
                    if( i+1 < h )
                    {
                        $('#'+me.name+'_'+i).bind( 'keyup', { 'next': i+1 }, function( evt ){
                            var e = $( this );
                            if( e.val().length == e.attr( 'maxlength' ) )
                            {
                                e.change();
                                $( '#'+me.name+'_'+evt.data.next ).focus();
                            }
                        } );
                    }    
                }
            }
		}
	);	$.fbuilder.controls[ 'fCommentArea' ]=function(){};
	$.extend( 
		$.fbuilder.controls[ 'fCommentArea' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Comments here",
			ftype:"fCommentArea",
			userhelp:"A description of the section goes here.",
			show:function()
				{
						return '<div class="fields '+this.csslayout+' comment_area" id="field'+this.form_identifier+'-'+this.index+'"><label id="'+this.name+'">'+this.title+'</label><span class="uh">'+this.userhelp+'</span><div class="clearer"></div></div>';
				}
		}
	);	$.fbuilder.controls[ 'fhidden' ]=function(){};
	$.extend(
		$.fbuilder.controls[ 'fhidden' ].prototype,
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			ftype:"fhidden",
			predefined:"",
			show:function()
				{
					return '<input id="'+this.name+'" name="'+this.name+'" type="hidden" value="'+$.fbuilder.htmlEncode(this.predefined)+'"/>';
				}
		}	
	);	$.fbuilder.controls[ 'fSectionBreak' ] = function(){};
	$.extend( 
		$.fbuilder.controls[ 'fSectionBreak' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Section Break",
			ftype:"fSectionBreak",
			userhelp:"A description of the section goes here.",
			show:function()
				{
						return '<div class="fields '+this.csslayout+' section_breaks" id="field'+this.form_identifier+'-'+this.index+'"><div class="section_break" id="'+this.name+'" ></div><label>'+this.title+'</label><span class="uh">'+this.userhelp+'</span><div class="clearer"></div></div>';
				}
		}
	);	$.fbuilder.controls[ 'fPageBreak' ]=function(){};
	$.extend(
		$.fbuilder.controls[ 'fPageBreak' ].prototype, 
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Page Break",
			ftype:"fPageBreak",
			show:function()
				{
						return '<div class="fields '+this.csslayout+' section_breaks" id="field'+this.form_identifier+'-'+this.index+'"><div class="section_break" id="'+this.name+'" ></div><label>'+this.title+'</label><span class="uh">'+this.userhelp+'</span><div class="clearer"></div></div>';
				}
		}
	);	$.fbuilder.controls[ 'fsummary' ] = function(){};
	$.extend(
		$.fbuilder.controls[ 'fsummary' ].prototype,
		$.fbuilder.controls[ 'ffields' ].prototype,
		{
			title:"Summary",
			ftype:"fsummary",
			fields:"",
			titleClassname:"summary-field-title",
			valueClassname:"summary-field-value",
			fieldsArray:[],
			show:function()
				{
				
					var p = $.trim(this.fields.replace( /\,+/g, ',') ).split( ',' ),
					    l = p.length,
						me = this;
					if( l )
					{
						var str = '<div class="fields '+this.csslayout+'" id="field'+this.form_identifier+'-'+this.index+'"><h2>'+this.title+'</h2><div id="'+this.name+'">';
						for( var i = 0; i < l; i++ )
						{
							if( !/^\s*$/.test( p[ i ] ) )
							{
								p[ i ] = $.trim( p[ i ] );
								this.fieldsArray.push( p[ i ] + this.form_identifier );
								$( document ).on( 'change', '#' + p[ i ] + this.form_identifier, function(){ me.update(); } );
								
								str += '<div ref="'+p[i]+this.form_identifier+'" class="cff-summary-item"><span class="'+this.titleClassname+' cff-summary-title"></span><span class="'+this.valueClassname+' cff-summary-value"></span>';
							}	
						}
						str += '</div></div>';
						
						$( document ).one( 'showHideDepEvent', function( evt, form_identifier )
						{
							me.update();
						});
						
						return str;
					}
				},
			update:function()
				{
					var me = this;
					for ( var j = 0, k = this.fieldsArray.length; j < k; j++ )
					{
						var i  = this.fieldsArray[ j ],
							e  = $( '[id="' + i + '"]'),
							tt = $( '[ref="' + i + '"]');

						if( e.length && tt.length )
						{	
							var t  = $( '#' + i ).parents( '.fields' ).find( 'label:first' ).text(), 
								v  = [];
								
							e.each( 
								function(){ 
									var e = $(this);
									if( /(checkbox|radio)/i.test( e.attr( 'type' ) ) && !e.is( ':checked' ) ) 
									{
										return;
									}
									else if( e[0].tagName == 'SELECT' )
									{
										v.push( $(e[0].options[ e[0].selectedIndex ]).attr( 'vt' ) );
									}
									else
									{
									
										if( e.attr( 'vt' ) )
										{
											v.push( e.attr( 'vt' ) );
										}
										else
										{
											v.push( e.val() );
										}
									}	
								}
							);
							
							tt.find( '.cff-summary-title' ).html( ( /^\s*$/.test( t ) ) ? '' : t+': ' );
							tt.find( '.cff-summary-value' ).html( v.join( ', ' ) );	

							if( e.hasClass( 'ignore' ) )
							{
								tt.find( '.cff-summary-item' ).hide();
							}
							else
							{
								tt.find( '.cff-summary-item' ).show();
							}
						}	
					}
				}
	});
	        var fcount = 1;
        var fnum = "_"+fcount;
        while (eval("typeof cp_contactformpp_fbuilder_config"+fnum+" != 'undefined'"))
        {
            try {
            var cp_contactformpp_fbuilder_config = eval("cp_contactformpp_fbuilder_config"+fnum);
            var f = $("#fbuilder"+fnum).fbuilder($.parseJSON(cp_contactformpp_fbuilder_config.obj));
			f.fBuild.loadData("form_structure"+fnum);
			$("#cp_contactformpp_pform"+fnum).validate({
                ignore:".ignore,.ignorepb",
			    errorElement: "div",
			    errorPlacement: function(e, element) 
					{
						if (element.hasClass('group'))
							element = element.parent();
						e.insertBefore(element);
						e.addClass('message'); // add a class to the wrapper
						e.css('position', 'absolute');
						e.css('left',0 );
						e.css('top',element.parent().outerHeight(true));
					}
     		});
     		} catch (e) {}
	    	fcount++;
	    	fnum = "_"+fcount;
	    }
})(fbuilderjQuery);
});