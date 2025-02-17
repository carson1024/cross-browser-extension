import { formatAddressV3, formatNumber } from "./lib/utils";

let accountInfoMap: {[key:string]: any} = {};
fetch('https://api.rugcheck.xyz/public/known_accounts.json').then(async (response: Response) => {
    if (!response.ok) return;
    accountInfoMap = await response.json();
}).catch((error) => {
    console.log(error);
});

export async function checkInsiders (mintAddress: string) {
    const response = await fetch(`https://api.rugcheck.xyz/v1/tokens/${mintAddress}/report`);
    if (!response.ok) {
        return {
            success: false,
            error: response.statusText
        }
    }
    const data = await response.json();
    if (!data || !data.topHolders || !data.topHolders.length) {
        return {
            success: false,
            error: 'No holders exist'
        }
    }
    return {
        success: true,
        data: data.topHolders
    }
}

export const getInsiderReports = (holders: any[]) => {
    if (!holders || !holders.length) return '';

    let html: string = `<table>
        <thead>
            <tr>
                <th>Account</th>
                <th>Amount</th>
                <th>Percentage</th>
            </tr>
        </thead>
    <tbody>`;
    holders.slice(0, 8).map((holder: any) => {
        if (!holder.uiAmount) return;

        const accountInfo = accountInfoMap[holder.owner];
        const account =  accountInfo ? accountInfo.name : formatAddressV3(holder.owner);
        html += `<tr>
            <td><a href="https://solana.fm/address/${holder.owner}" target="_blank">${account}</a></td>
            <td class="right">${formatNumber(holder.uiAmount)}</td>
            <td class="right">${holder.pct.toFixed(2)}%</td>
        </tr>`;
    });
    html += '</tbody></table>';
    return html;
}