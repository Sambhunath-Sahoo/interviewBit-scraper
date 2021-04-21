let request = require("request");
let cheerio = require("cheerio");
let path = require("path");
let alllinkObj = require("./getlink");


let url = "https://www.interviewbit.com/practice/";
request(url, function cb(err, res, html) {
    if (err) {
        console.log(err);
    } else {
        goinside(html);
    }
});




function goinside(html) {
    let selTool = cheerio.load(html);
    let topicpage = selTool(".panel-body > a");
    let fulllink = "https://www.interviewbit.com" + topicpage.attr("href");
    dorequest(fulllink);
}




function dorequest(fulllink) {
    request(fulllink, function cb(err, resp, html) {
        if (err) {
            console.log(err);
        } else {
            let seltool = cheerio.load(html);
            let alltopiclink = seltool(".topic-box.unlocked a");
            for (let i = 0; i < alltopiclink.length; i++) {
                let link = seltool(alltopiclink[i]).attr("href");
                let fulllink = "https://www.interviewbit.com" + link;
                alllinkObj.processalltopic(fulllink);
            }
        }
    });
}