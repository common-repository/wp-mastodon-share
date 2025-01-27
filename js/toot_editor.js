var toot_editor = {

	title: '',
	excerpt: '',
	permalink: '',
	hashtags: '',
	message: '',
	toot_limit_size: 0,

	field: {
		toot: document.getElementById('mastoshare_toot'),
		toot_current_size: document.getElementById('toot_current_size'),
		toot_limit_size: document.getElementById('toot_limit_size'),
		template: document.getElementById('mastoshare_toot_template'),

		title: document.getElementById('title'),
		excerpt: document.getElementById('excerpt'),
		permalink: document.getElementById('edit-slug-box'),
		tags: document.querySelector('ul.tagchecklist'),
		cw_content: document.getElementById('cw_content')
	},

	init: function(e) {

		this.field.toot_limit_size.innerText = this.field.toot.attributes.maxlength.value;
		this.toot_limit_size = this.field.toot.attributes.maxlength.value;
		this.bind_events();
		this.generate_toot();
	},
	generate_toot: function(reduce_of) {

		if(reduce_of == undefined)
			reduce_of = 0;

		this.message = this.field.template.value;

		this.title = this.field.title.value;
		this.excerpt = this.get_excerpt(reduce_of);
		this.permalink = this.get_permalink();
		this.hashtags = this.get_hashtags();

		var metas = [
			{name: 'title', value: this.title},
			{name: 'excerpt', value: this.excerpt},
			{name: 'permalink', value: this.permalink},
			{name: 'tags', value: this.hashtags}
		];

		for(var i in metas) {
			var item = metas[i];
			this.message = this.message.replace('[' + item.name + ']', item.value);
		}

		var cw_text_size = this.field.cw_content.value.length;
		if( cw_text_size > 0) {
			var new_limit_size = this.field.toot.attributes.maxlength.value - cw_text_size;
			this.field.toot_limit_size.innerText = new_limit_size;
			this.toot_limit_size = new_limit_size;
		} else {
			this.field.toot_limit_size.innerText = this.field.toot.attributes.maxlength.value;
		}

		if(this.message.length > this.toot_limit_size) {
			this.generate_toot(reduce_of - 1);
		} else {
			this.field.toot.value = this.message.trim();
			this.update_chars_counter();
		}


	},
	get_excerpt: function(reduce_of) {

		var content = tinymce.editors.content.getContent({format : 'text'});

		if(typenow != 'page'){

			if(this.field.excerpt.value.length != 0) {
				content = this.remove_html_tags(this.field.excerpt.value);
			}
		}

		if(reduce_of !==0)
		{
			content = content.substr(0, this.toot_limit_size);
			content = content.split(/(\n|\s)/).slice(0,reduce_of);
			var last_word = content[content.length-1];

			content = content.join('').replace(/(\s|\n)+$/, '') + '...';
		}

		return content;
	},
	get_permalink: function() {

		var sample_permalink_field = document.getElementById('sample-permalink');
		var editable_post_name_field =document.getElementById('editable-post-name');
		var editable_post_name_full_field = document.getElementById('editable-post-name-full');

		if(sample_permalink_field !== null)
			var sample_permalink = sample_permalink_field.innerText;

		if(editable_post_name_field != null)
			var editable_post_name = editable_post_name_field.innerText;

		if(editable_post_name_full_field != null)
			var editable_post_name_full = editable_post_name_full_field.innerText;

		if(sample_permalink != undefined && editable_post_name != undefined && editable_post_name_full != undefined) {
			var permalink = sample_permalink.replace(editable_post_name, editable_post_name_full);
			return permalink;
		} else {
			//New post/page case
			return "";
		}

	},
	get_hashtags: function() {
		var tags = document.querySelectorAll('#tagsdiv-post_tag .tagchecklist span.screen-reader-text');
		var hashtags = '';

		tags.forEach(function(item){
			hashtags +='#' + item.innerText.split(':')[1].trim() + ' ';
		});

		return hashtags.trim();
	},
	update_chars_counter: function(){
		this.field.toot_current_size.innerText = this.field.toot.value.length;
	},
	remove_html_tags: function(string) {
		return string.replace(/<(?!\/?>)[^>]*>/gm, '');
	},
	bind_events: function() {

		var that = this;

		var observer = new MutationObserver(function(mutationsList){
			that.generate_toot();
		});

		observer.observe(this.field.permalink, {attributes: true, childList: true});

		this.field.title.addEventListener('keyup', function() {
			that.generate_toot();
		});

		this.field.toot.addEventListener('keyup', function() {
			that.update_chars_counter();
		});

		this.field.toot.addEventListener('onpaste', function() {
			that.update_chars_counter();
		});

		this.field.cw_content.addEventListener('keyup', function(){
			that.generate_toot();
		});

		this.field.cw_content.addEventListener('onpaste', function(){
			that.generate_toot();
		});

		if(typenow == 'post') {

			observer.observe(this.field.tags, {attributes: true, childList: true});

			this.field.excerpt.addEventListener('keyup', function() {
				that.generate_toot();
			});

		}
	}
};