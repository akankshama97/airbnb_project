console.log("akanksha..");
const fs = required('fs');
fs.writeFile("output.txt", "Writing File", (err) => {
    if(err) console.log("Error occured");
    else console.log('File Written Succesfully');
})