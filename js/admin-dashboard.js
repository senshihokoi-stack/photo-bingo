// ============================
// Firebase
// ============================

import {
    db
} from "./firebase.js";


import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ============================
// HTML要素
// ============================

const teamList =
    document.getElementById(
        "teamList"
    );


const photoModal =
    document.getElementById(
        "photoModal"
    );


const photoModalTitle =
    document.getElementById(
        "photoModalTitle"
    );


const photoList =
    document.getElementById(
        "photoList"
    );


const closePhotoModal =
    document.getElementById(
        "closePhotoModal"
    );


// ============================
// チーム一覧取得
// ============================

async function loadTeams() {

    try {

        teamList.innerHTML = `

            <p>
                チーム情報を読み込んでいます...
            </p>

        `;


        const teamsSnapshot =
            await getDocs(
                collection(
                    db,
                    "teams"
                )
            );


        if (
            teamsSnapshot.empty
        ) {

            teamList.innerHTML = `

                <div class="no-team">

                    <p>
                        まだチームの写真登録がありません。
                    </p>

                </div>

            `;

            return;

        }


        teamList.innerHTML = "";


        for (
            const teamDoc of teamsSnapshot.docs
        ) {

            const teamName =
                teamDoc.id;


            // ============================
            // 写真一覧取得
            // ============================

            const photosSnapshot =
                await getDocs(
                    collection(
                        db,
                        "teams",
                        teamName,
                        "photos"
                    )
                );


            const photoCount =
                photosSnapshot.size;


            // ============================
            // チームカード
            // ============================

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "team-card";


            // ============================
            // 進捗率
            // ============================

            const progress =
                Math.round(
                    (
                        photoCount /
                        25
                    ) *
                    100
                );


            // ============================
            // COMPLETE判定
            // ============================

            const isComplete =
                photoCount >= 25;


            if (
                isComplete
            ) {

                card.classList.add(
                    "team-complete"
                );

            }


            card.innerHTML = `

                <div class="team-card-header">

                    <h3>
                        チーム ${teamName}
                    </h3>

                    ${
                        isComplete
                        ?
                        `
                        <span class="complete-badge">
                            🎉 COMPLETE!!
                        </span>
                        `
                        :
                        ""
                    }

                </div>


                <div class="team-progress">

                    <strong>
                        ${photoCount} / 25
                    </strong>

                    <span>
                        ${progress}%
                    </span>

                </div>


                <div class="progress-bar">

                    <div
                        class="progress-fill"
                        style="width:${Math.min(progress, 100)}%"
                    >
                    </div>

                </div>


                <div class="team-card-buttons">

                    <button
                        class="view-team-button"
                    >
                        📷 写真を確認
                    </button>


                    <button
                        class="delete-team-button"
                    >
                        🗑️ チームを削除
                    </button>

                </div>

            `;


            // ============================
            // 写真確認ボタン
            // ============================

            const viewButton =
                card.querySelector(
                    ".view-team-button"
                );


            viewButton.addEventListener(
                "click",
                function () {

                    showTeamPhotos(
                        teamName,
                        photosSnapshot
                    );

                }
            );


            // ============================
            // チーム削除ボタン
            // ============================

            const deleteButton =
                card.querySelector(
                    ".delete-team-button"
                );


            deleteButton.addEventListener(
                "click",
                async function () {

                    const confirmed =
                        confirm(
                            `チーム ${teamName} を削除しますか？\n\nこのチームのFirestore上の写真データ ${photoCount}件も削除されます。\n\n※ Cloudinaryに保存されている画像は削除されません。`
                        );


                    if (
                        !confirmed
                    ) {

                        return;

                    }


                    // ボタンを無効化
                    deleteButton.disabled =
                        true;


                    deleteButton.textContent =
                        "削除中...";


                    try {

                        // ============================
                        // 写真データを削除
                        // ============================

                        for (
                            const photoDoc of photosSnapshot.docs
                        ) {

                            await deleteDoc(
                                doc(
                                    db,
                                    "teams",
                                    teamName,
                                    "photos",
                                    photoDoc.id
                                )
                            );

                        }


                        // ============================
                        // チーム本体を削除
                        // ============================

                        await deleteDoc(
                            doc(
                                db,
                                "teams",
                                teamName
                            )
                        );


                        alert(
                            `チーム ${teamName} を削除しました。`
                        );


                        // ============================
                        // 一覧を再読み込み
                        // ============================

                        await loadTeams();


                    } catch (
                        error
                    ) {

                        console.error(
                            "チーム削除エラー:",
                            error
                        );


                        alert(
                            "チームの削除に失敗しました。\n\n" +
                            error.message
                        );


                        // ボタンを元に戻す
                        deleteButton.disabled =
                            false;


                        deleteButton.textContent =
                            "🗑️ チームを削除";

                    }

                }
            );


            teamList.appendChild(
                card
            );

        }


    } catch (
        error
    ) {

        console.error(
            "チーム情報取得エラー:",
            error
        );


        teamList.innerHTML = `

            <div class="error-message">

                <p>
                    チーム情報の取得に失敗しました。
                </p>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


// ============================
// チーム写真表示
// ============================

function showTeamPhotos(
    teamName,
    photosSnapshot
) {

    photoModalTitle.textContent =
        `チーム ${teamName} の登録写真`;


    photoList.innerHTML = "";


    if (
        photosSnapshot.empty
    ) {

        photoList.innerHTML = `

            <p>
                登録写真はありません。
            </p>

        `;

    }


    // ============================
    // ミッション番号順に並べる
    // ============================

    const photos =
        photosSnapshot.docs
            .map(
                function (
                    doc
                ) {

                    return {

                        id:
                            doc.id,

                        data:
                            doc.data()

                    };

                }
            )
            .sort(
                function (
                    a,
                    b
                ) {

                    return (
                        Number(a.id) -
                        Number(b.id)
                    );

                }
            );


    // ============================
    // 写真表示
    // ============================

    photos.forEach(
        function (
            photo
        ) {

            const data =
                photo.data;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "photo-item";


            item.innerHTML = `

                <div class="photo-item-title">

                    ${Number(photo.id) + 1}.
                    ${data.missionTitle || "ミッション"}

                </div>


                <img
                    src="${data.imageUrl}"
                    alt="${data.missionTitle || "写真"}"
                    class="admin-photo"
                >

            `;


            photoList.appendChild(
                item
            );

        }
    );


    photoModal.style.display =
        "flex";

}


// ============================
// モーダルを閉じる
// ============================

closePhotoModal.addEventListener(
    "click",
    function () {

        photoModal.style.display =
            "none";

    }
);


// ============================
// 背景クリックで閉じる
// ============================

photoModal.addEventListener(
    "click",
    function (
        event
    ) {

        if (
            event.target === photoModal
        ) {

            photoModal.style.display =
                "none";

        }

    }
);


// ============================
// 初期読み込み
// ============================

loadTeams();