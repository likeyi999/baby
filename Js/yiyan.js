//let params = new URLSearchParams(args);
const baseURL = "https://api.unsplash.com/photos/random";
const args = $argument.split("&").reduce((acc, cur) => {
    const [key, value] = cur.split("=");
        acc[key] = value;
    return acc;
}, {});
const fullURL = `${baseURL}?client_id=${args["client_id"]}&topics=${args["topics"]}&count=${args["count"]}`
//const fullURL = `${baseURL}?${$argument}`;

function getYiYan() {
    return new Promise((resolve, reject) => {
        $httpClient.get("https://v1.hitokoto.cn?encode=json&c=c&c=c&c=c&c=c&c=c", (err, resp, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    let obj = JSON.parse(data);
                    resolve({
                        yiYan: obj.hitokoto,
                        from: obj.from,
                        fromAuthor: obj.from_who
                    });
                } catch (parseError) {
                    reject(parseError);
                }
            }
        });
    });
}

getYiYan().then(result => {
    const { yiYan, from, fromAuthor } = result;
    $httpClient.get(fullURL, (error, response, data) => {
        if (!error && response.status === 200) {
            try {
                let obj = JSON.parse(data)[0];
                //let author = obj.user.name;
                let origin;
                
                if (!fromAuthor || from === fromAuthor) {
                    origin = from;
                } else {
                    origin = `${from}--${fromAuthor}`;
                }

                let options = {
                    "action": "open-url",
                    "url": obj.links.html,  // Linked webpage to the photo
                    "media-url": obj.urls.small  // Photo image in low resolution
                };

                $notification.post(`${args["ScriptName"]}`, origin, yiYan, options);
            } catch (parseError) {
                $notification.post("Parse Error", "Failed to parse Unsplash data", "");
            }
        } else {
            $notification.post("Fetch Error", "No images found or bad request", "");
        }
        $done();
    });
}).catch(error => {
    $notification.post("Error", error.message, "");
    $done();
});