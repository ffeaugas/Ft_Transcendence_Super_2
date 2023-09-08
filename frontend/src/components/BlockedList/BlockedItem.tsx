import styles from "@/styles/BlockedList/BlockedItem.module.css";

type BlockedItem = {
    id: string;
    username: string;
    profile: any;
    status: string;
};

type BlockedDatasProps = {
    blockedDatas: BlockedItem;
};

export default function BlockedItem({ blockedDatas }: BlockedDatasProps) {
    let status = blockedDatas.status;
    let dynamicClassName = `${styles[status]}`;
    return (
        <div className={styles.bloquedItem}>
            <img
                className={`${styles[status]}`}
                src={`http://${process.env.NEXT_PUBLIC_DOMAIN}:3001/uploads/avatar/${blockedDatas.profile["profilePicture"]}`}
            />
            <p>{blockedDatas.username}</p>
        </div>
    );
}
