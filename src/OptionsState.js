import Storage from "./lib/sfjs/storageManager"

export default class OptionsState {

  static OptionsStateChangeEventSearch = "OptionsStateChangeEventSearch";
  static OptionsStateChangeEventTags = "OptionsStateChangeEventTags";
  static OptionsStateChangeEventViews = "OptionsStateChangeEventViews"
  static OptionsStateChangeEventTags = "OptionsStateChangeEventSort"

  constructor(json) {

    this.init();
    _.merge(this, _.omit(json, ["changeObservers"]));
    this.changeObservers = [];

    if(this.sortBy == "updated_at") {
      // migrate to client modified date if using old property
      this.sortBy = "client_updated_at";
    }
  }

  init() {
    this.selectedTags = [];
    this.sortBy = "created_at";
  }

  reset() {
    this.init();
    this.notifyObservers();
  }

  async loadSaved() {
    return Storage.get().getItem("options").then(function(result){
      _.merge(this, _.omit(JSON.parse(result), ["changeObservers"]));
      this.notifyObservers();
    }.bind(this))
  }

  persist() {
    Storage.get().setItem("options", JSON.stringify(this));
  }

  toJSON() {
    return {sortBy: this.sortBy, archivedOnly: this.archivedOnly, selectedTags: this.selectedTags};
  }

  addChangeObserver(callback) {
    var observer = {key: Math.random, callback: callback};
    this.changeObservers.push(observer);
    return observer;
  }

  removeChangeObserver(observer) {
    _.pull(this.changeObservers, observer);
  }

  notifyObservers(event) {
    this.changeObservers.forEach(function(observer){
      observer.callback(this, event);
    }.bind(this))
  }

  // Interface

  mergeWith(options) {
    _.extend(this, _.omit(options, ["changeObservers"]));
    this.notifyObservers();
  }

  setSearchTerm(term) {
    this.searchTerm = term;
    this.notifyObservers(OptionsState.OptionsStateChangeEventSearch);
  }

  setSortBy(sortBy) {
    this.sortBy = sortBy;
    this.notifyObservers(OptionsState.OptionsStateChangeEventSort);
  }

  setArchivedOnly(archived) {
    this.archivedOnly = archived;
    this.notifyObservers(OptionsState.OptionsStateChangeEventViews);
  }

  setSelectedTags(selectedTags) {
    this.selectedTags = selectedTags;
    this.notifyObservers(OptionsState.OptionsStateChangeEventTags);
  }
}
