import { checkBundle, checkToken, checkInsiders } from './check';
import { getBundleReports } from './check/bundle';
import { getInsiderReports } from './check/insider';
import { RPC_URL } from './check/lib/constants';
import './index.css';
import { config } from '@common/config';
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

const _SOLANA_CONNECTION = new Connection(RPC_URL);

console.log(`Content script main`, config);

const globalCSS = `
._ex_modal {
    position: fixed;
    z-index: 9999;
    border-radius: 8px;
    background-color: #151419;
    padding: 16px;
    font-size: 16px;
    visibility: hidden;
    border: 1px solid #222;
    box-shadow: 0px 4px 10px #000;
    overflow: auto;
    display: flex;
    flex-direction: column;
}
._ex_modal > ._ex_block {
    border-radius: 7px;
    background-color: #1a1c24;
    padding: 10px 20px;
    margin-top: 12px;
}
._ex_modal > ._ex_block._ex_block_first {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}
._ex_modal > ._ex_block._ex_block_second {
    padding: 10px 0px;
    display: flex;
    flex-grow: 1;
}
._ex_modal > ._ex_block:first-of-type {
    margin-top: 0px;
}
._ex_modal > ._ex_block ._ex_title {
    font-weight: 700;
    color: white;
    font-size: 18px;
}
._ex_modal > ._ex_block ._ex_sub_title {
    font-size: 18px;
    color: #5fc43e;
}
._ex_modal > ._ex_block > ._ex_block_body {
    display: flex;
    flex-direction: column;
    background-color: #1a1c24;
    padding: 5px 20px;
    border-radius: 7px;
}
._ex_modal > ._ex_block > ._ex_block_body > ._ex_block_header {
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 5px;
}
._ex_modal > ._ex_block > ._ex_block_body > ._ex_block_content {
    flex-grow: 1;
    overflow: auto;
    padding: 10px 0px;
    position: relative;
    min-height: 150px;
    max-height: 500px;
}

._ex_modal > ._ex_block > ._ex_block_body > ._ex_block_content::after {
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1a1c24;
}

._ex_modal > ._ex_block > ._ex_block_body > ._ex_block_content.loading::after {
    content: 'Loading...';
    color: #faad14 !important;
}

._ex_modal > ._ex_block > ._ex_block_body > ._ex_block_content.error {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fa363a !important;
}

._ex_modal > ._ex_block > ._ex_block_body > ._ex_block_content.no-data::after {
    content: 'No data to show';
    color: #faad14 !important;
}

._ex_modal > ._ex_block > ._ex_block_rows {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 5px;
}
._ex_modal > ._ex_block > ._ex_block_rows > ._ex_block_row {
    padding: 5px 20px 0px 20px;
    position: relative;
    cursor: pointer;
}
._ex_modal > ._ex_block > ._ex_block_rows > ._ex_block_row:hover {
    background: #214e12;
}
._ex_modal > ._ex_block > ._ex_block_rows > ._ex_block_row > ._ex_block_item::after {
    content: '>';
    right: 25px;
    top: 10px;
    position: absolute;
}

._ex_modal > ._ex_block > ._ex_block_rows > ._ex_block_row > ._ex_block_item {
    border-bottom: 1px solid #333;
    padding: 5px 30px 5px 5px;
    width: 100%;
    text-align: left;
    font-size: 16px;
    font-weight: 700;
    color: white;
}

._ex_modal .danger {
    color:#fa363a !important;
}
._ex_modal .warning {
    color: #faad14 !important;
}
._ex_modal > ._ex_block ._ex_result {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
}

._ex_modal > ._ex_block ._ex_label {
    font-size: 14px;
    color: white;
}
._ex_modal > ._ex_block ._ex_value {
    font-size: 14px;
    border-radius: 3px;
    background-color: #141720;
    color: #5fc43e;
    padding: 5px;
}
._ex_modal > ._ex_block ._ex_value > ._ex_detail {
    color: #454966;
}
._ex_btn_analyze {
    background-color: #666;
    color: white;
    padding: 2px 8px;
}
._ex_btn_analyze.rounded {
    border-radius: 7px;
}
._ex_btn_analyze.circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    padding: 0px;
}
._ex_btn_analyze:hover {
    background-color: #333;
    color: white;
}
#_ex_block_back_btn {
    padding: 2px 5px 0px 5px;
    font-size: 20px;
}
._ex_modal table th, ._ex_modal table td {
    text-align: left;
    padding: 5px 10px;
}
._ex_modal table td.right {
    text-align: right;
}
._ex_modal table a[href] {
    text-decoration: underline;
    text-underline-offset: 5px;
}
`;

// Create a <style> element
const styleElement = document.createElement('style');
styleElement.innerHTML = globalCSS;

// Append the <style> element to the <head>
document.head.appendChild(styleElement);

const modalElement = document.createElement('div');
modalElement.className = '_ex_modal';
modalElement.id = '_ex_modal';

let tokenInfo: any = {
    address: '',
    symbol: '',
    name: ''
}
let checkInfo: any = {
    bundle: {
        label: 'Token Bundle Transactions',
        show: true
    },
    insider: {
        label: 'Insider & Whale Holdings',
        show: true,
    },
    twitter: {
        label: 'Twitter Reuse & History',
        show: true,
    },
    wallet: {
        label: 'Fresh Wallets or CEX-Funded Wallets',
        show: true,
    },
    early: {
        label: 'Track Early PF Holders & Sales',
        show: true,
    },
    dexscreener: {
        label: 'Dexscreener Paid Status',
        show: true,
    },
    verify: {
        label: 'Verify Locked Tokens & Liquidity',
        show: true,
    },
    scam: {
        label: 'Honeypot & Scam Detection',
        show: true,
    },
    developer: {
        label: 'Developer’s Past Deployments',
        show: true,
    },
}
modalElement.innerHTML = `
<div class="_ex_block _ex_block_first">
    <span class="_ex_title"></span>
    <span class="_ex_sub_title"></span>
</div>
<div class="_ex_block _ex_block_second">
    <div class="_ex_block_rows">
    </div>
    <div class="_ex_block_body">
        <div class="_ex_block_header">
            <button type="button" id="_ex_block_back_btn">&lt;</button>
            <span class="_ex_title">Developer’s Past Deployments:</span>
        </div>
        <div class="_ex_block_content loading">
        </div>
    </div>
</div>
`;

document.body.appendChild(modalElement);

const dropdown = modalElement;
const checkList = dropdown.querySelector('._ex_block_rows') as HTMLElement;
const backButton = dropdown.querySelector('#_ex_block_back_btn');
const detailPage = dropdown.querySelector('._ex_block_body') as HTMLElement;
const detailTitle = detailPage.querySelector('._ex_title') as HTMLElement;
const detailContent = dropdown.querySelector('._ex_block_content') as HTMLElement;

var isLoading = false;

const showDetailPage = (visible: boolean) => {
    if (visible) {
        detailPage.style.display = 'flex';
        checkList.style.display = 'none';
    }else {
        checkList.style.display = 'flex';
        detailPage.style.display = 'none';
    }
}

if (backButton) {
    backButton.addEventListener('click', () => {
        showDetailPage(false);
    });
}

let checkCache: any = {};
const updateDetailContent = (type: string, checkCallback: any, getReports: any) => {
    if (checkCache && checkCache[type]) {
        detailContent.classList.remove('loading');
        detailContent.innerHTML = getReports(checkCache[type]);
    }else {
        checkCallback(tokenInfo.address).then((result: any) => {
            detailContent.classList.remove('loading');
            console.log(result);
            if (!result || !result.success) {
                detailContent.classList.add('error');
                detailContent.classList.remove('loading');
                detailContent.innerHTML = result.error;
                return;
            }
            checkCache[type] = result.data;
            detailContent.innerHTML = getReports(result.data);
        }).catch((reason: any) => {
            detailContent.classList.add('error');
            detailContent.classList.remove('loading');
            detailContent.innerHTML = 'Unknown Error';
        });
    }
}

const updateDetailPage = (type: string | null) => {
    if (!type || !checkInfo[type]) return;
    let info = checkInfo[type];
    detailTitle.innerHTML = info.label;
    detailContent.classList.remove('error');
    detailContent.classList.remove('no-data');
    detailContent.classList.add('loading');
    detailContent.innerHTML = '';
    if (!tokenInfo || !tokenInfo.address) return;
    switch (type) {
        case 'bundle':
            updateDetailContent(type, checkBundle, getBundleReports);
            break;
        case 'insider':
            updateDetailContent(type, checkInsiders, getInsiderReports);
            break;
    }
}

const initCheckList = () => {
    if (checkList) {
        let checkListHtml = '';
        Object.keys(checkInfo).map((key: string) => {
            let info = checkInfo[key];
            checkListHtml += `
            <div class="_ex_block_row">
                <button class="_ex_block_item" data-type=${key}>
                    ${info.label}:
                </button>
            </div>
            `;
        });
        checkList.innerHTML = checkListHtml;
    
        checkList.querySelectorAll('button._ex_block_item').forEach((button: Element) => {
            button.addEventListener('click', () => {
                if (isLoading) return;
                updateDetailPage(button.getAttribute('data-type'));
                showDetailPage(true);
            });
        });
    } 
}

initCheckList();

const handleClick = (button: any, link: any) => {
    if (link && link.href) {
        showModal(button);
        if (dropdown.style.visibility != 'hidden') {
            showLoading();
            checkToken(link.href).then((data: any) => {
                console.log("Token Info", data);
                if (!data || !data.address) {
                    rebuildModal();
                    return;
                }
                rebuildModal(data);
            });
        }
    }
}

const showLoading = () => {
    isLoading = true;
    const titleNode = dropdown.querySelector('._ex_block_first');
    titleNode && (titleNode.innerHTML = `<span class="_ex_title warning">Loading...</span>`);
}

const rebuildModal = (info: any = null) => {
    if (tokenInfo?.address != info?.address) {
        checkCache = {};
    }
    tokenInfo = info;
    isLoading = false;
    const titleNode = dropdown.querySelector('._ex_block_first');
    if (titleNode) {
        if (!info) {
            titleNode.innerHTML = `<span class="_ex_title danger">TOKEN ERROR!!!</span>`;
        }else {
            titleNode.innerHTML = `
                <span class="_ex_title">$${ info.symbol }</span>
                <span class="_ex_sub_title">${ info.name }</span>
            `;
        }
    }
}

const showModal = (button: any) => {
  if (!dropdown) return;
  dropdown.style.height = 'auto';
  if (dropdown.style.visibility == 'hidden') {
      // Get button's position on the screen
      const rect = button.getBoundingClientRect();
    
      // Calculate where to place the dropdown (below or above the button)
      const dropdownHeight = dropdown.offsetHeight || dropdown.scrollHeight || dropdown.clientHeight;
      const viewportHeight = window.innerHeight;
    
      // Check if there's enough space below the button
      if (rect.bottom + dropdownHeight <= viewportHeight) {
        // Place dropdown below the button
        dropdown.style.top = rect.bottom + 'px';
      } else {
        // Otherwise, place it above the button
        console.log(rect.top, dropdownHeight);
        if (rect.top > dropdownHeight) {
            dropdown.style.top = rect.top - dropdownHeight + 'px';
        }else {
            dropdown.style.top = '0px';
            dropdown.style.height = rect.top + 'px';
        }
      }
    
      // Position it horizontally aligned with the button
      dropdown.style.left = rect.left + 'px';
      dropdown.style.visibility = 'visible';
  } else {
    hideModel();
  }
}

const hideModel = () => {
    if (!dropdown || !detailPage) return;
    showDetailPage(false);
    dropdown.style.visibility = 'hidden';
}

document.body.addEventListener('click', (event: any) => {
    if(dropdown && !event.target.closest('#_ex_modal')) {
        hideModel();
    }
});

const wrapper = document.querySelector('.custom-a3qv9n');
if (wrapper) {
    wrapper.addEventListener('scroll', () => {
        hideModel();
    });
}

export const addButtonEventListener = (button: any, link: any) => {
    button.addEventListener('click', (event: any) => {
        if (event.target && (event.target.classList.contains('_ex_btn_analyze'))) {
            event.preventDefault();
            event.stopPropagation();
            handleClick(event.target, link);
        }else if (event.target.closest('button._ex_btn_analyze')) {
            event.preventDefault();
            event.stopPropagation();
            handleClick(event.target.closest('button._ex_btn_analyze'), link);
        }
    });
}