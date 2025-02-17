import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

const _SOLANA_CONNECTION = new Connection(clusterApiUrl("devnet"));

window.addEventListener("message", async (event) => {
    if (event.data.type === "FROM_CHECK_WALLET") {
        switch (event.data.message) {
            case 'DISCONNECT_WALLET':
                break;
        }
    }
});