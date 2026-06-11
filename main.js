let currentCategory = "movies";
let currentRegion = "global";
let selectedFile = null;
let watchlistVisible = false;

const regionFilter =
    document.getElementById(
        "region-filter"
    );

const contextMenu =
    document.getElementById("context-menu");

const watchlistGrid =
    document.getElementById("unwatched-grid");

const toggleBtn =
    document.getElementById("toggle-unwatched");

watchlistGrid.style.display = "none";
toggleBtn.textContent = "Show Watchlist";

function getState() {

    return JSON.parse(
        localStorage.getItem(
            "absoluteCinemaState"
        )
    ) || {};
}

function saveState(state) {

    localStorage.setItem(
        "absoluteCinemaState",
        JSON.stringify(state)
    );
}

function getFileState(file) {

    const state = getState();
    if (!state[file]) {
        state[file] = {
            status: "unwatched",
            tier: null
        };
        saveState(state);
    }
    return state[file];
}

function moveFile(file, target) {

    const state = getState();
    if (!state[file]) {
        state[file] = {
            status: "unwatched",
            tier: null
        };
    }

    if (target === "unwatched") {
        state[file].status =
            "unwatched";
        state[file].tier =
            null;
    }
    else {
        state[file].status =
            "watched";
        state[file].tier =
            target;
    }
    saveState(state);
    render();
}

function imagePath(category, file) {

    return `assets/posters/${category}/${file}`;
}

function formatTitle(filename) {

    return filename
        .replace(/\.[^/.]+$/, "")
        .split("-")
        .map(word =>
            word.charAt(0)
                .toUpperCase()
            + word.slice(1)
        )
        .join(" ");
}

function createCard(category, file) {

    const card =
        document.createElement("div");
    card.className =
        "poster-card";
    card.innerHTML = `
        <img
            src="${imagePath(
        category,
        file
    )}"
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
            selectedFile =
                file;
            const menuWidth =
                230;
            const menuHeight =
                250;
            let x =
                e.clientX;
            let y =
                e.clientY;
            if (
                x + menuWidth >
                window.innerWidth
            ) {
                x =
                    window.innerWidth
                    - menuWidth
                    - 15;
            }
            if (
                y + menuHeight >
                window.innerHeight
            ) {
                y =
                    window.innerHeight
                    - menuHeight
                    - 15;
            }

            contextMenu.style.display =
                "block";
            contextMenu.style.left =
                x + "px";
            contextMenu.style.top =
                y + "px";
        }
    );
    return card;
}

function renderTierSection(

    sectionId,
    title,
    tierKey

) {

    const section =
        document.getElementById(
            sectionId
        );
    let files = [];

        if(currentCategory === "movies"){
        files = currentRegion === "global"
        ? MEDIA.movies
        : MEDIA.indianmovies;
        }
        else if(currentCategory === "shows"){
            files = currentRegion === "global"
                ? MEDIA.shows
                : MEDIA.indianshows;
        }

    const tierFiles =
        files.filter(file => {
            const info =
                getFileState(file);
            return (
                info.status ===
                "watched"
                &&
                info.tier ===
                tierKey
            );
        });

    section.innerHTML = `
    <div class="tier-left">
        <div class="tier-title">
            ${title}
        </div>
    </div>
    <div class="poster-grid">
    </div>
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

function render() {

    let files = [];

    if(currentCategory === "movies"){
    files = currentRegion === "global"
        ? MEDIA.movies
        : MEDIA.indianmovies;
    }
    else if(currentCategory === "shows"){
        files = currentRegion === "global"
            ? MEDIA.shows
            : MEDIA.indianshows;
    }
    else{

        files =
            MEDIA[currentCategory]
            || [];
    }

    watchlistGrid.innerHTML = "";

    files.forEach(file => {

        const info = getFileState(file);

        if (info.status === "unwatched") {

            watchlistGrid.appendChild(
                createCard(
                    currentCategory,
                    file
                )
            );
        }
    });

    renderTierSection(
        "absolute-cinema-section",
        "Absolute Cinema",
        "absolute-cinema"
    );

    renderTierSection(
        "peak-fiction-section",
        "Peak Fiction",
        "peak-fiction"
    );

    renderTierSection(
        "watchable-section",
        "Watchable",
        "watchable"
    );

    renderTierSection(
        "waste-of-time-section",
        "Waste Of Time",
        "waste-of-time"
    );
}

document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            document
                .querySelectorAll(".nav-btn")
                .forEach(nav =>
                    nav.classList.remove("active")
                );

            btn.classList.add("active");

            currentCategory =
            btn.dataset.category;

            if (
                currentCategory === "movies" ||
                currentCategory === "shows"
            ){
                regionFilter.classList.remove(
                    "hidden"
                );
            }
            else{
                regionFilter.classList.add(
                    "hidden"
                );
            }

            render();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    });

document
    .querySelectorAll(".region-btn")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            document
                .querySelectorAll(".region-btn")
                .forEach(item =>
                    item.classList.remove("active")
                );

            btn.classList.add("active");

            currentRegion =
                btn.dataset.region;

            render();
        });
    });

document
    .querySelectorAll(".sub-btn")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            document
                .querySelectorAll(".sub-btn")
                .forEach(sub =>
                    sub.classList.remove("active")
                );

            btn.classList.add("active");

            currentSubCategory =
                btn.dataset.sub;

            render();
        });
    });

toggleBtn.addEventListener("click", () => {

    watchlistVisible = !watchlistVisible;
    if (watchlistVisible) {
        watchlistGrid.style.display = "grid";
        toggleBtn.textContent = "Hide Watchlist";
    } else {
        watchlistGrid.style.display = "none";
        toggleBtn.textContent = "Show Watchlist";
    }
});

document

    .querySelectorAll(
        "#context-menu button"
    )
    .forEach(btn => {
        btn.addEventListener(
            "click",
            () => {
                if (
                    !selectedFile
                ) return;

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

if (regionFilter) {
    if (
        currentCategory === "movies" ||
        currentCategory === "shows"
    ) {
        regionFilter.classList.remove("hidden");
    } else {
        regionFilter.classList.add("hidden");
    }
}
window.addEventListener("load", () => {
    render();
    console.log(
    "render",
    currentCategory,
    currentRegion
);  
});