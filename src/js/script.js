import "../sass/style.scss";
import $ from 'jquery';

import multisort from "multisort";
import moment from "moment";

import {maps} from './_maps';
import {achievements} from './_achievements';
import {i18n} from './i18n';

const version = '0.9.8';
const debug = false;

const langs = [ 'fr', 'en' ];
const Gw2ApiUrl = 'https://api.guildwars2.com/v2';

const language = localStorage.getItem('language');
const lang = (language && langs.indexOf(language) >= 0) ? language : 'fr';

const token = localStorage.getItem('token');
const hideFishs = localStorage.getItem('hide-fishs');

const rarity = [
    'basic',
    'fine',
    'masterwork',
    'rare',
    'exotic',
    'ascended',
    'legendary'
];

let fishs = [];
let spots = [];
let baits = [];
let regions = [];
let mapsIds = [];
let achievementsIds = [];
let achievementsRepeatIds = [];
let baitsInventory = [];
let baitsIds = [];
let currentCharacter = 'Svipdag Völuspá';
let baitsFilters = [];
let baitsRegionFilters = [];
let spotsFilters = [];
let spotsRegionFilters = [];
let GW2Link = false;

let filters = {
    'region': '',
    'map': 0,
    'bait': '',
    'spot': '',
    'time': '',
};

function t(id) {
    return (i18n[lang][id]) ? i18n[lang][id] : `__${id}`;
}

$(document).on('change', 'select#spots, select#baits, select#regions', function(e) {

    if(e.currentTarget.id === 'regions') {
        filters['bait'] = '';
        filters['spot'] = '';
        document.querySelector('select#baits').value = '';
        document.querySelector('select#spots').value = '';
    }

    let id = $(this).attr('id'),
        filter = id.slice(0, -1),
        value = $(this).val();
    filters[filter] = value;
    filterFishs();
});

function filterFishs() {

    $('#fishs .fish').hide();
    $('#no-fish').hide();

    if(typeof(mapsIds[filters.map]) == 'undefined') {
        filters.map = '';
    }

    if(filters.time == 'dd') {
        filters.time = '';
    }

    let target = '';
    for (const [key, value] of Object.entries(filters)) {
        if(value) {
            if(key == 'map') {
                let achievement = mapsIds[value];
                target = `${target}[data-achievement="${achievement}"]`;
            } else {
                target = `${target}[data-${key}="${value}"]`;
            }

        }
    }

    // console.log(target);
    $('#fishs .fish'+target).show();

    target = '';
    let tmpTime = filters.time;
    filters.time = 'a';
    for (const [key, value] of Object.entries(filters)) {
        if(value) {
            if(key == 'map') {
                let achievement = mapsIds[value];
                target = `${target}[data-achievement="${achievement}"]`;
            } else {
                target = `${target}[data-${key}="${value}"]`;
            }

        }
    }
    $('#fishs .fish'+target).show();

    filters.time = tmpTime;

    if($('#fishs .fish:visible').length <= 0) {
        $('#no-fish').show();
    }

    updateFiltersOptions();
}

function updateFiltersOptions() {

    if(typeof baitsFilters[filters.map] !== 'undefined') {
        document.querySelectorAll('select#baits option').forEach(function(opt) {
            if(opt.value) {
                opt.disabled = true;
            }
            if(baitsFilters[filters.map].indexOf(opt.value) >= 0) {
                opt.disabled = false;
            }
        });
    } else if(typeof baitsRegionFilters[filters.region] !== 'undefined') {
        document.querySelectorAll('select#baits option').forEach(function(opt) {
            if(opt.value) {
                opt.disabled = true;
            }
            if(baitsRegionFilters[filters.region].indexOf(opt.value) >= 0) {
                opt.disabled = false;
            }
        });
    } else {
        document.querySelectorAll('select#baits option').forEach(function(opt) {
            if(opt.value) {
                opt.disabled = false;
            }
        });
    }

    if(typeof spotsFilters[filters.map] !== 'undefined') {
        document.querySelectorAll('select#spots option').forEach(function(opt) {
            if(opt.value) {
                opt.disabled = true;
            }
            if(spotsFilters[filters.map].indexOf(opt.value) >= 0) {
                opt.disabled = false;
            }
        });
    } else if(typeof spotsRegionFilters[filters.region] !== 'undefined') {
        document.querySelectorAll('select#spots option').forEach(function(opt) {
            if(opt.value) {
                opt.disabled = true;
            }
            if(spotsRegionFilters[filters.region].indexOf(opt.value) >= 0) {
                opt.disabled = false;
            }
        });
    } else {
        document.querySelectorAll('select#spots option').forEach(function(opt) {
            if(opt.value) {
                opt.disabled = false;
            }
        });
    }
}


/** DayTime **/

const clocks = {
    'tyria': {
        0: 'n',
        25: 'dd',
        30: 'd',
        140: 'dd',
        145: 'n',

    },
    'cantha': {
        0: 'n',
        35: 'dd',
        40: 'd',
        135: 'dd',
        140: 'n',
    }
};

function updateClock(r) {

    const date = new Date();
    let m = date.getUTCMinutes();
    m = (m < 10) ? '0'+m : m;
    const t = parseInt((date.getUTCHours()%2).toString() + m.toString());

    let moment;

    for (const [k, v] of Object.entries(clocks[r])) {
        if(t >= k) {
            moment = v;
        }
    }

    filters.time = moment;

    if(debug) {
        document.getElementById('debugTime').innerText = `${moment} (${t})`;
    }

    $('#clock').removeClass().addClass(moment).html(`<span class="sprite-icon icon-${moment}"></span>`);
}

function dailyFishUpdate() {

    let dailyFish = localStorage.getItem('daily-fish');
    let today = moment().utc().format("YYYY-MM-DD");

    $.get('https://combinatronics.com/thoanny/fishing-companion/main/daily.txt', function(d) {

        let daily = (d.trim()).split(',');

        if(daily[0] !== today) {
            return;
        }

        if(dailyFish && dailyFish === daily[0]) {
            return;
        }

        const div = document.querySelector(`[data-fish="${daily[1]}"]`);
        if(div) {
            const clone = div.cloneNode(true);
            clone.id = "daily-fish";
            clone.removeAttribute('data-fish');
            clone.removeAttribute('data-bait');
            clone.removeAttribute('data-bait');
            clone.removeAttribute('data-spot');
            clone.removeAttribute('data-time');
            clone.removeAttribute('data-region');
            clone.removeAttribute('data-achievement');
            clone.removeAttribute('data-repeat-achievement');
            clone.removeAttribute('style');

            const dailyDiv = document.querySelector('#daily');
            dailyDiv.classList.remove('hidden');
            dailyDiv.innerHTML = `<h3><a href="#!" id="dailyClose"><span class="sprite-icon icon-close"></span></a> Poisson du jour</h3>${clone.outerHTML}`;

            document.querySelector('#dailyClose').addEventListener('click', () => {
                localStorage.setItem('daily-fish', today);
                document.querySelector('#daily').classList.add('hidden');
            });
        }

    });
}

function initCompanion() {

    // Translation
    document.getElementById('title').textContent = t('app.title');
    document.getElementById('no-fish').textContent = t('fishs.zero');
    document.getElementById('settingsTitle').textContent = t('settings.title');
    document.getElementById('settingsLanguageLabel').textContent = t('settings.language');
    document.getElementById('settingsGw2TokenLabel').textContent = t('settings.gw2token');
    document.getElementById('settingsGw2TokenHelp').textContent = t('settings.gw2token.help');
    document.getElementById('settingsHideFishsLabel').textContent = t('settings.hidefishs');
    document.getElementById('settingsClose').textContent = t('settings.close');
    document.getElementById('settingsSave').textContent = t('settings.save');
    document.getElementById('newVersionLabel').innerHTML = t('app.newversion');
    document.getElementById('version').innerHTML = version;
    document.getElementById('infoText').innerHTML = t('info.text');
    // document.getElementById('tackleboxTitle').textContent = t('tacklebox.title');

    // Debug Popup
    if(debug) {
        const debugPopup = document.getElementById('debugPopup');
        debugPopup.classList.remove("hidden");
    }

    // Check version
    $.get('https://combinatronics.com/thoanny/fishing-companion/main/version.txt', function(v) {
        if(v.trim() > version.trim()) {
            const newVersionPopup = document.getElementById('newVersionPopup');
            const newVersionClose = document.getElementById('newVersionClose');
            newVersionPopup.classList.remove("hidden");

            newVersionClose.addEventListener('click', function() {
                newVersionPopup.classList.add('hidden');
            });
        }
    });

    maps.forEach(function(region) {

        achievementsIds.push(region.achievement_id);
        achievementsRepeatIds.push(parseInt(region.repeat_achievement_id));

        regions.push(region.achievement[lang]);

        region.ids.forEach(function(id) {
            mapsIds[id] = region.achievement_id;
        });

        let baitsList = [],
            spotsList = [];

        region.fishs.forEach(function(fish) {
            let bait = (fish.bait[lang]) ? fish.bait[lang] : t('baits.any');
            let spot = (fish.spot[lang]) ? fish.spot[lang] : t('spots.any');

            fishs.push({
                'region': region.achievement[lang],
                'id': fish.item_id,
                'bait': bait,
                'bait_value': (fish.bait[lang]) ? fish.bait[lang] : '',
                'spot': spot,
                'spot_value': (fish.spot[lang]) ? fish.spot[lang] : '',
                'time': ((fish.time === '') ? 'a' : fish.time),
                'time_value': fish.time,
                'achievement': region.achievement_id,
                'achievement_repeat': region.repeat_achievement_id,
                'rarity_index': rarity.indexOf(fish.rarity),
                'rarity': fish.rarity,
                'name': fish.name[lang],
                'power': fish.power,
                'strange_diet': fish.strange_diet,
                'specialization': fish.specialization,
            });


            if(baitsList.indexOf(bait) < 0) {
                baitsList.push(bait);
            }

            if(spotsList.indexOf(spot) < 0) {
                spotsList.push(spot);
            }

            // if(fish.bait_id && typeof baitsInventory[fish.bait_id] == 'undefined') {
            //     baitsInventory[fish.bait_id] = {
            //         'name': fish.bait[lang],
            //         'count': 0
            //     };
            // }
        });

        region.ids.forEach(function(id) {
            baitsFilters[id] = baitsList;
            spotsFilters[id] = spotsList;
        });

        baitsRegionFilters[region.achievement[lang]] = baitsList;
        spotsRegionFilters[region.achievement[lang]] = spotsList;

        region.fishs.forEach(function(fish) {
            let bait = fish.bait[lang];
            if(bait !== '') {
                if(baits.indexOf(bait) < 0) {
                    baits.push(bait);
                }
            }

            let spot = fish.spot[lang];
            if(spot !== '') {
                if(spots.indexOf(spot) < 0) {
                    spots.push(spot);
                }
            }
        });
    });

    multisort(fishs, [
        'region',
        'rarity_index',
        'name'
    ]);

    fishs.forEach(function(fish) {

        let strange_diet = '';
        if(fish.strange_diet) {
            strange_diet = `<span class="sprite-icon icon-turtle"></span>`;
        }

        let specialization = '';
        if(fish.specialization) {
            specialization = `<span class="sprite-icon icon-${fish.specialization}"></span>`;
        }

        $('#fishs').append(`<div class="fish rarity-${fish.rarity}" 
            data-fish="${fish.id}" 
            data-bait="${fish.bait}" 
            data-spot="${fish.spot}" 
            data-time="${fish.time}"
            data-region="${fish.region}"
            data-achievement="${fish.achievement}"
            data-repeat-achievement="${fish.achievement_repeat}"
        >
            <div class="fish-icon sprite-icon icon-${fish.id}"></div>
            <div>
                <div class="name">${fish.name}${strange_diet}${specialization}</div>
                <div class="metas">
                    <span><span class="sprite-icon icon-map"></span>${fish.region}</span>
                    ${(fish.spot_value) ? `<span><span class="sprite-icon icon-water"></span>${fish.spot}</span>` : ''}</span>
                    ${(fish.bait_value) ? `<span><span class="sprite-icon icon-bait"></span>${fish.bait}</span>` : ''}
                    ${(fish.power) ? `<span><span class="sprite-icon icon-power"></span>${fish.power}</span>` : ''}
                    ${(fish.time_value) ?  `<span><span class="sprite-icon icon-${(fish.time) ? fish.time : 'time'}"></span>${t('time.'+fish.time)}</span>` : ''}
                </div>
            </div>
        </div>`);
    });

    $('#baits').append($('<option>', {
        value: '',
        text: t('baits.default')
    }));

    baits.push(t('baits.any'));
    baits.sort(function (a, b) {
        return a.localeCompare(b);
    });
    baits.forEach(function(b) {
        $('#baits').append($('<option>', {
            value: b,
            text: b
        }));
    });

    $('#spots').append($('<option>', {
        value: '',
        text: t('spots.default')
    }));

    spots.push(t('spots.any'));
    spots.sort(function (a, b) {
        return a.localeCompare(b);
    });
    spots.forEach(function(s) {
        $('#spots').append($('<option>', {
            value: s,
            text: s
        }));
    });

    $('#regions').append($('<option>', {
        value: '',
        text: t('regions.default')
    }));

    regions.sort(function (a, b) {
        return a.localeCompare(b);
    });
    regions.forEach(function(r) {
        $('#regions').append($('<option>', {
            value: r,
            text: r
        }));
    });

    // baitsInventory.forEach(function(bait, id) {
    //     baitsIds.push(id);
    //
    //     $('#baitsList').append(`<div class="bait"
    //         data-id="${id}"
    //     >
    //         <div class="name"><span class="bait-icon sprite-icon icon-${id}"></span>${bait.name}</div>
    //         <div class="count">${bait.count}</div>
    //     </div>`);
    // });

}

const GW2LinkState = document.querySelector('#gw2link');
const selectRegions = document.querySelector('select#regions')

const GW2LinkOnline = new CustomEvent('GW2LinkState', {
    detail: {
        state: 'online'
    }
});

const GW2LinkOffline = new CustomEvent('GW2LinkState', {
    detail: {
        state: 'offline'
    }
});

document.addEventListener('GW2LinkState', (e) => {
    let online = (e.detail.state == 'online') ? true : false;
    selectRegions.style.display = (online) ? 'none' : 'block';
    GW2LinkState.classList.remove( (online) ? 'offline' : 'online' );
    GW2LinkState.classList.add( (online) ? 'online' : 'offline' );

    if(online) {
        filters['region'] = '';
        selectRegions.value = '';
    } else {
        filters['map'] = 0;
    }

    if(GW2Link !== online) {
        filters['spot'] = '';
        filters['bait'] = '';
        document.querySelector('select#baits').value = '';
        document.querySelector('select#spots').value = '';
    }

    GW2Link = online;

});

function updateCompanion() {

    $.getJSON('http://127.0.0.1:7232', function(res) {

        // console.log(res.identity.map_id);
        // console.log(res);

        if(res.identity && res.identity.map_id !== filters.map) {
            filters.map = res.identity.map_id;
            filters.bait = '';
            filters.spot = '';
            $("#spots").val("");
            $("#baits").val("");

            if(debug) {
                document.getElementById('debugCharacter').innerText = res.identity.name;
                document.getElementById('debugMapId').innerText = res.identity.map_id;
            }
        }

        if(res.identity && res.identity.name !== currentCharacter) {
            currentCharacter = res.identity.name;
        }

        if(res.identity && res.status == 'online') {
            document.dispatchEvent(GW2LinkOnline);
        } else {
            document.dispatchEvent(GW2LinkOffline);
        }

        if(debug) {
            document.getElementById('debugGW2MumbleLink').innerText = res.status;
        }

        postUpdateCompanion();

    }).fail(function() {
        document.dispatchEvent(GW2LinkOffline);
        postUpdateCompanion();

        if(debug) {
            document.getElementById('debugGW2MumbleLink').innerText = 'offline';
        }
    });

}

function postUpdateCompanion() {
    if(filters.map > 0) {
        if([1442, 1438, 1428, 1452, 1422, 1462].indexOf(filters.map) >= 0) {
            updateClock('cantha');
            if(debug) {
                document.getElementById('debugTimeSet').innerText = 'Cantha';
            }
        } else {
            updateClock('tyria');
            if(debug) {
                document.getElementById('debugTimeSet').innerText = 'Tyrie';
            }
        }
    } else {

        if(filters.region && ['Echovald', 'Kaineng', 'Seitung', 'Trépas', 'Dragon\'s End'].indexOf(filters.region) >= 0) {
            updateClock('cantha');
            if(debug) {
                document.getElementById('debugTimeSet').innerText = 'Cantha';
            }
        } else {
            updateClock('tyria');
            if(debug) {
                document.getElementById('debugTimeSet').innerText = 'Tyrie';
            }
        }

    }

    filterFishs();
}

function checkBaitsInventory() {
    console.log('checkBaitsInventory()')

    if(!currentCharacter) {
        return;
    }

    let baitsInventoryCount = baitsInventory;

    $.ajaxSetup({
        headers : {
            'Authorization' : 'Bearer ' + token
        },
    });

    $.getJSON(Gw2ApiUrl+'/characters/'+currentCharacter+'/inventory', function(res) {
        console.log(res);

        if(!res) {
            return;
        }

        res.bags.forEach(function(bag) {
            bag.inventory.forEach(function(item) {
                if(item && baitsIds.indexOf(item.id) >= 0) {
                    baitsInventoryCount[item.id]['count'] = baitsInventoryCount[item.id]['count'] + item.count;
                    console.log(item)
                }
            });
        });

        console.log(baitsInventoryCount)
    });
}

window.addEventListener('load', (event) => {
    initCompanion();

    updateCompanion();
    setInterval(updateCompanion, 10000);

    dailyFishUpdate();
    setInterval(dailyFishUpdate, 600000); // 10 minutes

    if(token) {
        checkAchievementsFishs();
        setInterval(checkAchievementsFishs, 60000 * 3); // 3 minutes

        // checkBaitsInventory();
    }
});

/**
 * Settings
 */

const app = document.getElementById('app');
const settingsButton = document.getElementById('settingsButton');
const settingsClose = document.getElementById('settingsClose');
const settingsPopup = document.getElementById('settingsPopup');
const settingsForm = document.getElementById('settingsForm');
const settingsErrors = document.getElementById('settingsErrors');
const infoButton = document.getElementById('infoButton');
const infoPopup = document.getElementById('infoPopup');
const infoClose = document.getElementById('infoClose');

let settingsLanguage = document.getElementById('settingsLanguage');
let settingsGw2Token = document.getElementById('settingsGw2Token');
let settingsHideFishs = document.getElementById('settingsHideFishs');
settingsLanguage.value = lang;
settingsGw2Token.value = token;

if(hideFishs === 'true') {
    settingsHideFishs.checked = true;
    app.classList.add('hide-fishs');
}

settingsButton.addEventListener('click', function() {
    // tackleboxClose.click();
    settingsPopup.classList.remove("hidden");
    app.classList.add("popup");
});

settingsClose.addEventListener('click', function(e) {
    e.preventDefault();
    settingsPopup.classList.add("hidden");
    app.classList.remove("popup");
});

infoButton.addEventListener('click', function() {
    settingsPopup.classList.add("hidden");
    infoPopup.classList.remove("hidden");
    app.classList.add("popup");

    infoClose.addEventListener('click', function(e) {
        e.preventDefault();
        infoPopup.classList.add("hidden");
        app.classList.remove("popup");
    });
});

settingsForm.addEventListener('submit', function(e) {
    e.preventDefault();

    let errors = [];

    if(langs.indexOf(settingsLanguage.value) >= 0) {
        localStorage.setItem('language', settingsLanguage.value);
    }

    if(settingsGw2Token.value) {
        $.ajaxSetup({
            headers : {
                'Authorization' : 'Bearer ' + settingsGw2Token.value
            },
            async: false,
        });

        $.getJSON(Gw2ApiUrl+'/tokeninfo', function(res) {

            /**
             * Permissions :
             * - progression : masteries, achievements
             * - characters : characters
             * - inventories : characters
             */

            if(
                res.permissions.indexOf('characters') >= 0
                && res.permissions.indexOf('progression') >= 0
                && res.permissions.indexOf('inventories') >= 0
            ) {
                localStorage.setItem('token', settingsGw2Token.value);
            } else {
                errors.push(t('gw2api.permissions'));
                settingsGw2Token.value = (token) ? token : '';
            }
        }).fail(function() {
            errors.push(t('gw2api.invalidtoken'));
            settingsGw2Token.value = (token) ? token : '';
        });
    } else if(!settingsGw2Token.value && token) {
        localStorage.removeItem('token');
    }

    localStorage.setItem('hide-fishs', (settingsHideFishs.checked) ? true : false);


    if(errors.length == 0) {
        location.reload();
        return;
    }

    settingsErrors.innerHTML = '<div>'+errors.join('</div><div>')+'</div>';

});

let achievementsData = [];

achievements.forEach(function(a) {
    achievementsData[a.id] = {
        'bits': []
    }

    achievementsIds.push(a.id);

    a.bits.forEach(function(b, i) {
        achievementsData[a.id]['bits'][i] = b.id;
    });

});

function checkAchievementsFishs() {

    $.ajaxSetup({
        headers : {
            'Authorization' : 'Bearer ' + token
        },
    });

    $.getJSON(Gw2ApiUrl+'/account/achievements', function(res) {
        $('.fish.fish-done').removeClass('fish-done');
        $('.fish.fish-done-repeat').removeClass('fish-done-repeat');
        res.forEach(function(a) {
            if(achievementsIds.indexOf(a.id) >= 0) {
                if(!a.done) {
                    a.bits.forEach(function(b) {
                        $('.fish[data-fish="'+achievementsData[a.id]['bits'][b]+'"]').addClass('fish-done');
                    });
                }
            }
        });

        res.forEach(function(a) {
            if(achievementsRepeatIds.indexOf(a.id) >= 0) {
                $('.fish[data-repeat-achievement="'+a.id+'"]').removeClass('fish-done');
                if(!a.done) {
                    a.bits.forEach(function(b) {
                        $('.fish[data-fish="'+achievementsData[a.id]['bits'][b]+'"]').addClass('fish-done-repeat');
                    })
                }
            }
        });

        if($('.fish:visible').length <= 0) {
            $('#no-fish').show();
        }
    });

}

function updateBaits() {
    $.ajaxSetup({
        headers : {
            'Authorization' : 'Bearer ' + token
        },
    });

    $.getJSON(Gw2ApiUrl+'/account/achievements', function(res) {
        $('.fish.fish-done').removeClass('fish-done');
        $('.fish.fish-done-repeat').removeClass('fish-done-repeat');
        res.forEach(function(a) {
            if(achievementsIds.indexOf(a.id) >= 0) {
                if(!a.done) {
                    a.bits.forEach(function(b) {
                        $('.fish[data-fish="'+achievementsData[a.id]['bits'][b]+'"]').addClass('fish-done');
                    });
                }
            }
        });

        res.forEach(function(a) {
            if(achievementsRepeatIds.indexOf(a.id) >= 0) {
                $('.fish[data-repeat-achievement="'+a.id+'"]').removeClass('fish-done');
                if(!a.done) {
                    a.bits.forEach(function(b) {
                        $('.fish[data-fish="'+achievementsData[a.id]['bits'][b]+'"]').addClass('fish-done-repeat');
                    })
                }
            }
        });

        if($('.fish:visible').length <= 0) {
            $('#no-fish').show();
        }
    });
}
/**
 * Tacklebox
 */

// const tackleboxButton = document.getElementById('tackleboxButton');
// const tackleboxPopup = document.getElementById('tackleboxPopup');
// const tackleboxClose = document.getElementById('tackleboxClose');
//
// tackleboxButton.addEventListener('click', function() {
//     settingsClose.click();
//     app.classList.add("popup");
//     tackleboxPopup.classList.remove("hidden");
// });
//
// tackleboxClose.addEventListener('click', function() {
//     tackleboxPopup.classList.add('hidden');
//     app.classList.remove("popup");
// });
