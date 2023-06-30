const pages = [
  { pageName: '/', pageID: 'top' },
  { pageName: '/news/', pageID: '' },
  { pageName: '/news/detail/', pageID: 'news' },
  { pageName: '/service/extras.html', pageID: '' }
];
const titleMeta = [
  'sample title',
  'sample title 01',
  'sample title 02',
  'sample title 03',
];
const description = [
  'sample description',
  'sample description 01',
  'sample description 02',
  'sample description 03',
];
const keywords = [];

const fs = require('fs');
const link = '.';

module.exports = function (grunt) {

  grunt.registerTask('files', 'Auto create pug and sass files.', function () {
    const done = this.async();

    async function createFiles() {
      try {
        await Promise.all(
          pages.map(async (item, index) => {
            let page = item.pageName;
            let pageID = '';
            if (item.pageID) pageID = item.pageID;
            // Create folder
            if (!fs.existsSync(`${link}/pug` + page) && page !== '/') {
              let index = page.lastIndexOf('/');
              tempPage = page.slice(0, index + 1);
              await fs.mkdirSync(`${link}/pug` + tempPage, { recursive: true });
            }
            // Page
            const regex = /.html/gi;
            page = page.replace(regex, '.pug');
            if (page.slice(-1) === '/') {
              page += 'index.pug';
            }

            // Get pageID
            let clonePage = page;
            clonePage = clonePage.split('');
            let slashIndex = clonePage
              .map((item, index) => (item === '/' ? index : undefined))
              .filter((x) => x);
            slashIndex.unshift(0);
            slashIndex.splice(0, slashIndex.length - 2);
            if (pageID === '') {
              if (page === '/index.pug') pageID = 'top';
              else if (page.endsWith('index.pug') && slashIndex.length > 1)
                pageID = page.slice(slashIndex[0] + 1, slashIndex[1]);
              else {
                slashLastIndex = page.lastIndexOf('/');
                pugLastIndex = page.lastIndexOf('.pug');
                pageID = page.slice(slashLastIndex + 1, pugLastIndex);
              }
            }

            // Get path
            const numberIndex = page.split('/').length - 1;
            switch (numberIndex) {
              case 1:
                path = '.';
                break;
              case 2:
                path = '..';
                break;
              case 3:
                path = '../..';
                break;
              case 4:
                path = '../../..';
                break;
              case 5:
                path = '../../../..';
                break;
              case 6:
                path = '../../../../..';
            }
            // Create files
            await fs.writeFileSync(
              `${link}/pug` + page,
              `extends ${path}/_layouts/default

block vars
  -title        = '${titleMeta[index] ? titleMeta[index] : ''}'
  -description  = '${description[index] ? description[index] : ''}'
  -keywords     = '${keywords[index] ? keywords[index] : ''}'
  -pageID       = '${pageID}'
  -path         = '${path}'
  -imgPC        = path+'/img/'+pageID+'/'
  -imgSP        = path+'/img/'+pageID+'/sp/'

block container`
            );

            await fs.writeFileSync(
              `${link}/sass/${pageID}.sass`,
              `@charset "utf-8"
@use "base/base" as base
@use "parts/header"
@use "parts/footer"`
            );
          })
        );
        console.log('Create file successfully!');
        console.log(
          { page: pages.length },
          { meta: titleMeta.length },
          { description: description.length },
          { keywords: keywords.length }
        );
        done();
      } catch (e) {
        console.log(e);
      }
    }

    createFiles();

  });

};
