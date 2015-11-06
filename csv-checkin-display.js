
if (Meteor.isClient) {
  Checkins = new Mongo.Collection('checkins')

  Template.main.helpers({
    getCountries(){
      return Checkins.find().fetch()
    }
  })

  Template.upload.events({
    'change #file': function (e) {
      let file = e.target.files[0]
      // start the promise chain
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (e)=>resolve(e.target.result);
        reader.readAsArrayBuffer(file);
      })
      .then((arrayBuffer) => new JSZip(arrayBuffer))
      .then((zip)=>{
        let files = zip.files
        let fileArr = []
        for(let key in files){
          // hah. It's a silly face
          if(key.indexOf('_')<0){
            // we'd like to avoid the __ and _ file names and
            // only grab the ones we want
            fileArr.push(files[key])
          }
        }
        return fileArr
      })
      .then((files)=>{
        // turn the zip file into an array buffer
        return Promise.all(files.map((file)=>file.asUint8Array()))
      })
      .then((csv)=>{
        // turn the arrayBuffer into text
        let decoder = new TextDecoder()
        // concat the arrays
        text = csv.map((a)=>decoder.decode(a))
          .reduce((string, csv, self)=>{
            string+=csv
            return string
          },"")
        // call the server to update the collection
        Meteor.call('csvToCollection', text)
      })

      .catch((e)=>console.log(e.stack, e.message))

    }
  });
}

if (Meteor.isServer) {
  let Checkins = new Mongo.Collection('checkins')
  Checkins._ensureIndex({Name: 1}, {unique:1});
  Meteor.methods({
    'csvToCollection':function(csv){
      // clear the collection each time
      Checkins.remove({})
      // add stuff to the collection
      c2c.addCsvStringToCollection(Checkins, csv)
    }
  })
}
