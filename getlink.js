let request = require("request");
let cheerio = require("cheerio");
let path = require("path");
let fs = require("fs");
let xlsx = require("xlsx");



function processalltopic(url) {
    request(url, function cb(err, resp, html) {
        if (err) {
            console.log(err);
        } else {
            extractallqustion(html);
        }
    });
}



function extractallqustion(html) {
    let seltool = cheerio.load(html);
    
    let arr=[];
    
    let topicname = seltool(".panel-title");
    topicname = seltool(topicname[0]).text();

    let problemstable = seltool(".panel.assignment-list.panel-default");
    for(let i=0; i<problemstable.length; i++) {
        let tableheading = seltool(problemstable[i]).find(".panel-heading").text();

        let tabledata = seltool(problemstable[i]).find("tbody tr");

        for(let j=0; j<tabledata.length; j++){
            // extracting the columns
            let prolemlink = "https://www.interviewbit.com" + seltool(tabledata[j]).find(".locked.problem_title").attr("href");
            let problemname = path.basename(prolemlink).toUpperCase();
            let companieslinkarr = seltool(tabledata[j]).find(".problem-tags a");
            let companynamestr = "";
            for(let cmp=0; cmp<companieslinkarr.length; cmp++){
                let cmpname = seltool(companieslinkarr[cmp]).attr("href");
                let companyname = path.basename(cmpname).slice(3);
                companynamestr += companyname + ", ";
            }
            let avgtime  = seltool(tabledata[j]).find(".time_to_solve").text();
            let pscore = seltool(tabledata[j]).find(".problem_score").text();
            let done = "No";
            let obj = {topicname : topicname, 
                problemname: problemname, 
                prolemlink:prolemlink, 
                avgtime: avgtime, 
                companynamestr: companynamestr, 
                done: done
            };
            arr.push(obj);
            processquestions(topicname , problemname, prolemlink, pscore, avgtime, companynamestr, done);
        }
    }
    console.table(arr);
}




function processquestions(topicname,problemname, prolemlink, pscore, avgtime, companynamestr, done) {
    if(topicname.length > 30) {
        topicname = topicname.substring(0, 30);
    }
    let folderpath = path.join(__dirname, "Interviewbit question");
    dirCreater(folderpath);

    let filePath = path.join(folderpath, topicname+".xlsx");
    let content = excelReader(filePath, topicname);
    let matchObj = {
        problemname, prolemlink, pscore, avgtime, companynamestr, done
    }

    content.push(matchObj);
    excelWriter(filePath, content, topicname);
}




function excelReader(filePath, name) {
    if (!fs.existsSync(filePath)) {
        return [];
    } else {
        let wt = xlsx.readFile(filePath);
        let excelData = wt.Sheets[name];
        let ans = xlsx.utils.sheet_to_json(excelData);
        return ans;
    }
}



function excelWriter(filePath, json, name) {;
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, name);
    xlsx.writeFile(newWB, filePath);
}



function dirCreater(folderPath) {
    if (fs.existsSync(folderPath) == false) {
        fs.mkdirSync(folderPath);
    }
}


module.exports = {
    processalltopic
}