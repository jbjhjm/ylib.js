YLib.Tools = {
	Tabs: function($els){

		$els.each(function(){
			var $wrapper = jQuery(this);
			var $nav = $wrapper.find('.nav');
			var $tabs = $wrapper.find('.tabs');

			$nav.on('click','a',function(e){
				e.preventDefault();
				var id = jQuery(this).attr('href');
				var $tab = $tabs.children(id);
				if($tab.length) {
					$tabs.children().removeClass('active');
					$tab.addClass('active');
					$nav.children().removeClass('active');
					jQuery(this).parent().addClass('active');
				}
			});

			var initialTab = $wrapper.attr('data-ylib-tabs');
			if(initialTab) {
				$nav.find('a[href="'+initialTab+'"]').click();
			}
		});

	}
};
jQuery(document).ready(function(){
	YLib.Tools.Tabs(jQuery('[data-ylib-tabs]'));
});
