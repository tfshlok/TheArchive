const CATEGORY_LABELS = {
    movies: "MOVIES",
    shows: "SHOWS",
    anime: "ANIME",
    animated: "ANIME MOVIES"
};

let currentCategory = "anime";
let selectedFile = null;

/* ELEMENTS */

const heroTitle =
document.getElementById("hero-title");

const heroSubtitle =
document.getElementById("hero-subtitle");

const contextMenu =
document.getElementById("context-menu");

const unwatchedGrid =
document.getElementById("unwatched-grid");

const toggleBtn =
document.getElementById("toggle-unwatched");

const unwatchedCount =
document.getElementById("unwatched-count");

/* STORAGE */

function getState(){

    return JSON.parse(
        localStorage.getItem(
            "absoluteCinemaState"
        )
    ) || {};
}

function saveState(state){

    localStorage.setItem(
        "absoluteCinemaState",
        JSON.stringify(state)
    );
}

function getFileState(file){

    const state = getState();

    if(!state[file]){

        state[file] = {

            status:"unwatched",

            tier:null
        };

        saveState(state);
    }

    return state[file];
}

function moveFile(file,target){

    const state = getState();

    if(!state[file]){

        state[file] = {
            status:"unwatched",
            tier:null
        };
    }

    if(target === "unwatched"){

        state[file].status =
            "unwatched";

        state[file].tier =
            null;
    }
    else{

        state[file].status =
            "watched";

        state[file].tier =
            target;
    }

    saveState(state);

    render();
}

/* HELPERS */

function imagePath(category,file){

    return `assets/posters/${category}/${file}`;
}

function formatTitle(filename){

    return filename
        .replace(/\.[^/.]+$/,"")
        .split("-")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
}

function createCard(category,file){

    const card =
    document.createElement("div");

    card.className =
    "poster-card";

    card.innerHTML = `
        <img
            src="${imagePath(category,file)}"
            alt="${formatTitle(file)}"
        >

        <div class="poster-info">
            <div class="poster-title">
                ${formatTitle(file)}
            </div>
        </div>
    `;

    card.addEventListener(
        "contextmenu",
        e => {

            e.preventDefault();

            selectedFile = file;

            contextMenu.style.display =
            "block";

            contextMenu.style.left =
            e.pageX + "px";

            contextMenu.style.top =
            e.pageY + "px";
        }
    );

    return card;
}

/* STATS */

function updateStats(){

    const files =
    MEDIA[currentCategory] || [];

    const state =
    getState();

    let ac = 0;
    let pf = 0;
    let watchable = 0;
    let wot = 0;

    files.forEach(file => {

        const info =
        state[file];

        if(!info) return;

        if(info.tier === "absolute-cinema")
            ac++;

        if(info.tier === "peak-fiction")
            pf++;

        if(info.tier === "watchable")
            watchable++;

        if(info.tier === "waste-of-time")
            wot++;
    });

    document.getElementById(
        "stat-total"
    ).textContent = files.length;

    document.getElementById(
        "stat-ac"
    ).textContent = ac;

    document.getElementById(
        "stat-pf"
    ).textContent = pf;

    document.getElementById(
        "stat-watchable"
    ).textContent = watchable;

    document.getElementById(
        "stat-wot"
    ).textContent = wot;
}

/* SECTION */

function renderTierSection(
    containerId,
    title,
    tierKey,
    lineClass
){

    const section =
    document.getElementById(
        containerId
    );

    const files =
    MEDIA[currentCategory] || [];

    const tierFiles =
    files.filter(file => {

        const info =
        getFileState(file);

        return (
            info.status === "watched" &&
            info.tier === tierKey
        );
    });

    section.innerHTML = `
        <div class="tier-header">

            <div class="tier-title">

                ${title}

                <span class="tier-count">
                    ${tierFiles.length}
                </span>

            </div>

            <div class="tier-line ${lineClass}">
            </div>

        </div>

        <div class="poster-grid"></div>
    `;

    const grid =
    section.querySelector(
        ".poster-grid"
    );

    tierFiles.forEach(file => {

        grid.appendChild(
            createCard(
                currentCategory,
                file
            )
        );
    });
}

/* RENDER */

function render(){

    const files =
    MEDIA[currentCategory] || [];

    heroTitle.innerHTML = `
        ${CATEGORY_LABELS[currentCategory]}
        <br>
        ARCHIVE
    `;

    heroSubtitle.textContent =
    `${files.length} Titles`;

    const unwatched =
    files.filter(file => {

        const info =
        getFileState(file);

        return (
            info.status === "unwatched"
        );
    });

    unwatchedCount.textContent =
    unwatched.length;

    unwatchedGrid.innerHTML = "";

    unwatched.forEach(file => {

        unwatchedGrid.appendChild(
            createCard(
                currentCategory,
                file
            )
        );
    });

    renderTierSection(
        "absolute-cinema-section",
        "ABSOLUTE CINEMA",
        "absolute-cinema",
        "absolute-line"
    );

    renderTierSection(
        "peak-fiction-section",
        "PEAK FICTION",
        "peak-fiction",
        "peak-line"
    );

    renderTierSection(
        "watchable-section",
        "WATCHABLE",
        "watchable",
        "watchable-line"
    );

    renderTierSection(
        "waste-of-time-section",
        "WASTE OF TIME",
        "waste-of-time",
        "waste-line"
    );

    updateStats();
}

/* NAVIGATION */

document
.querySelectorAll(".nav-btn")
.forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            document
            .querySelectorAll(".nav-btn")
            .forEach(x =>
                x.classList.remove(
                    "active"
                )
            );

            btn.classList.add(
                "active"
            );

            currentCategory =
            btn.dataset.category;

            render();

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });
        }
    );
});

/* UNWATCHED TOGGLE */

toggleBtn.addEventListener(
    "click",
    () => {

        unwatchedGrid.classList.toggle(
            "hidden"
        );

        toggleBtn.textContent =
        unwatchedGrid.classList.contains(
            "hidden"
        )
            ? "SHOW"
            : "HIDE";
    }
);

/* CONTEXT MENU */

document
.querySelectorAll(
    "#context-menu button"
)
.forEach(btn => {

    btn.addEventListener(
        "click",
        () => {

            if(!selectedFile)
                return;

            moveFile(
                selectedFile,
                btn.dataset.action
            );

            contextMenu.style.display =
            "none";
        }
    );
});

document.addEventListener(
    "click",
    () => {

        contextMenu.style.display =
        "none";
    }
);

render();