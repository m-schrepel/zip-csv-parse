if (Meteor.isClient) {
  Checkins = new Mongo.Collection('checkins')

  Template.hello.events({
    'change #file': function (e) {
      let file = e.target.files[0]
      console.log('input zip', file)
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (e)=>resolve(e.target.result);
        reader.readAsArrayBuffer(file);
      })
      .then((arrayBuffer) => new JSZip(arrayBuffer))
      .then((zip)=>{
        console.log('zip after jszip', zip.files)
        let files = zip.files
        let fileArr = [];
        for(let key in files){
          // hah. It's a silly face
          if(key.indexOf('_')<0){
            fileArr.push(files[key])
          }
        }
        return fileArr
      })
      .then((files)=>{
        console.log('filesArr', files)
        return Promise.all(files.map((file)=>file.asUint8Array()))
      })
      .then((csv)=>{
        console.log('fielesBuffer', csv)
        let decoder = new TextDecoder()
        text = csv.map((a)=>decoder.decode(a))
          .reduce((string, csv)=>{
            string+=csv
            return string
          },"")
        Meteor.call('csvToCollection', text)
      })

      .catch((e)=>console.log(e.stack, e.message))

    }
  });
}

if (Meteor.isServer) {
  let Checkins = new Mongo.Collection('checkins')
  Meteor.methods({
    'csvToCollection':function(csv){
      c2c.addCsvStringToCollection(Checkins, csv)
    }
  })
}
