var Backbone = require("backbone");
var $ = require("jquery");
var _ = require("underscore");

// Modelの作成
// ToDoアイテムのModel
var Item = Backbone.Model.extend({
  defaults: {
    text: "",
    isDone: false,
    editMode: false,
    isShow: true
  }
});
// 入力用のModel
var Form = Backbone.Model.extend({
  defaults: {
    val: "",
    hasError: false,
    errorMsg: ""
  }
});
// 検索用のModel
var Search = Backbone.Model.extend({
  defaults: {
    text: ""
  }
});

// ToDoリストのCollection
var List = Backbone.Collection.extend({
  model: Item
});

// ToDoアイテム表示用のView
var ItemView = Backbone.View.extend({
  template: _.template($("#template-list-item").html()),
  events: {
    "click .js-toggle-done": "toggleDone",
    "click .js-click-trash": "remove",
    "click .js-todo_list-text": "showEdit",
    "keyup .js-todo_list-editForm": "closeEdit"
  },
  initialize: function() {
    _.bindAll(this, "toggleDone", "render", "remove", "showEdit", "closeEdit");
    this.model.bind("change", this.render);
    this.model.bind("destroy", this.remove);
    this.render();
  },
  toggleDone: function() {
    this.model.set({ isDone: !this.model.get("isDone") });
  },
  remove: function() {
    $(this.el).remove();
  },
  showEdit: function() {
    this.model.set({ editMode: true });
  },
  closeEdit: function(e) {
    if (e.keyCode === 13 && e.shiftKey === true) {
      this.model.set({ text: e.currentTarget.value, editMode: false });
    }
  },
  render: function() {
    var template = this.template(this.model.attributes);
    $(this.el).html(template);
    return this;
  }
});

// To Doリスト用のViewの作成
var ListView = Backbone.View.extend({
  el: $(".js-todo_list"),
  initialize: function() {
    _.bindAll(this, "render", "appendItem", "addItem");
    this.collection.bind("add", this.appendItem);
    this.render();
  },
  addItem: function(text) {
    var model = new Item({ text: text });
    this.collection.add(model);
  },
  appendItem: function(model) {
    var itemView = new ItemView({ el: "<li>", model: model });
    console.log(itemView);
    $(this.el).append(itemView.render().el);
  },
  render: function() {
    var that = this;
    this.collection.each(function(model, i) {
      that.appendItem(model);
    });
    return this;
  }
});

// 入力フォーム用のViewの作成
var FormView = Backbone.View.extend({
  el: $(".js-form"),
  template: _.template($("#template-form").html()),
  events: {
    "click .js-add-todo": "addTodo"
  },
  initialize: function() {
    _.bindAll(this, "render", "addTodo");
    this.model.bind("change", this.render);
    this.render();
  },
  addTodo: function(e) {
    e.preventDefault();
    var text = $(".js-get-val").val();

    // 未入力の場合
    if (!text) {
      this.model.set({ hasError: true, errorMsg: "未入力です" });
      $(".js-toggle-error").show();
    } else {
      this.model.set({ hasError: false, val: $(".js-get-val").val() });
      listView.addItem(this.model.get("val"));
      $(".js-toggle-error").hide();
    }
  },
  render: function() {
    var template = this.template(this.model.attributes);
    this.$el.html(template);
    return this;
  }
});

// 検索用のViewの作成
var SearchView = Backbone.View.extend({
  el: $(".js-searchBox"),
  template: _.template($("#template-search").html()),
  events: {
    "keyup .js-search": "searchItem"
  },
  initialize: function() {
    _.bindAll(this, "render", "searchItem");
    this.render();
  },
  searchItem: function() {
    // 入力値の取得
    this.model.set({ text: $(".js-search").val() });
    var searchText = this.model.get("text");
    // 検索値の設定
    var regexp = new RegExp("^" + searchText);
    // リストデータの取得
    this.collection.each(function(model, i) {
      var text = model.get("text");
      // 判定
      if (text && text.match(regexp)) {
        model.set({ isShow: true });
      } else {
        model.set({ isShow: false });
      }
    });
  },
  render: function() {
    var template = this.template(this.model.attributes);
    $(this.el).html(template);
  }
});

// アイテムインスタンス生成
var item1 = new Item({ text: "sample1" });
var item2 = new Item({ text: "sample2" });
// var itemView1 = new ItemView({ el: $(".js-todo_list"), model: item1 });
var list = new List([item1, item2]);
var listView = new ListView({ collection: list });

// フォームインスタンス生成
var form = new Form();
var formView = new FormView({ model: form });

// 検索インスタンス生成
var search = new Search();
var searchView = new SearchView({ model: search, collection: list });
