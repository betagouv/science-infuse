## crawl videos from leblob

```javascript
async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // load all videos on the page by programmatically scrolling
  const loadAllVideos = async () => {
    let previousHeight;
    let newHeight = document.documentElement.scrollHeight;

    while (newHeight !== previousHeight) {
      previousHeight = newHeight;
      window.scrollTo(0, newHeight);
      await delay(2000);
      newHeight = document.documentElement.scrollHeight;
    }
  };

  await loadAllVideos();

  // store all yt video elements
  let videoElements = document.querySelectorAll("ytd-rich-item-renderer");
  //   collect datas about each video
  const data = [...videoElements]
    .sort((a, b) => {
      const durationElementa = a.querySelector(
        "span.ytd-thumbnail-overlay-time-status-renderer"
      );
      const durationElementb = b.querySelector(
        "span.ytd-thumbnail-overlay-time-status-renderer"
      );
      if (durationElementa && durationElementb) {
        const durationTexta = durationElementa.textContent.trim();
        const durationTextb = durationElementb.textContent.trim();
        const durationSecondsa = durationToSeconds(durationTexta);
        const durationSecondsb = durationToSeconds(durationTextb);
        return durationSecondsa - durationSecondsb;
      }
    })
    .map((v) => {
      const durationElement = v.querySelector(
        "span.ytd-thumbnail-overlay-time-status-renderer"
      );
      const durationText = durationElement.textContent.trim();
      const durationSeconds = durationToSeconds(durationText);
      const dateElement = v.querySelectorAll("#metadata-line span")[1];
      const date = dateElement
        ? dateElement.textContent.trim()
        : "Unknown Date";

      return {
        url: v.querySelector("a#thumbnail").href,
        title: v.querySelector("#video-title").innerText,
        duration: durationSeconds,
        date: date,
      };
    });
};
```

### extraction done Jun 12 at 21:16
[le_blob_videos.json](le_blob_videos.json)