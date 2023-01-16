# Scryfall Image Scraper

A basic script that downloads all unique art images from the [Scryfall](https://scryfall.com/) API. In the future, I'd like to turn this script into a CLI tool to handle cases where you only need a certain size of image, or images from a certain _Magic: The Gathering_ set.

For now, the following commands will run the script:

```bash
npm install # intstalls Axios for simpler async handling
npm run scrape
```

## Watch out!

Running the script will create directories at `./imgs/small` and `./imgs/normal`. The downloaded images will be placed inside of these directories, with their filenames corresponding to their Scryfall ID. I do **not** recommend running this script if the network you're on has a small data cap.

## Credit

Thanks to [Scryfall](https://scryfall.com/) for hosting such a robust source of _Magic_ data.

Scryfall provides card data as part of the [Wizards of the Coast Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy)
