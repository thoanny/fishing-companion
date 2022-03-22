import "../sass/style.scss";
import $ from 'jquery';

import {maps, achievements} from './data';
import {i18n} from './i18n';

const langs = [ 'fr', 'en' ];
const Gw2ApiUrl = 'https://api.guildwars2.com/v2';

const language = localStorage.getItem('language');
const lang = (language && langs.indexOf(language) >= 0) ? language : 'fr';

const token = localStorage.getItem('token');

let spots = [];
let baits = [];
let mapsIds = [];
let achievementsIds = [];
let achievementsRepeatIds = [];

let filters = {
    'map': '',
    'bait': '',
    'spot': '',
    'time': '',
};

function t(id) {
    return (i18n[lang][id]) ? i18n[lang][id] : `__${id}`;
}

$(document).on('change', 'select#spots, select#baits', function(e) {
    let id = $(this).attr('id'),
        filter = id.slice(0, -1),
        value = $(this).val();
    filters[filter] = value;
    filterFishs();
});

function filterFishs() {

    $('.fish').hide();
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
    $('.fish'+target).show();

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
    $('.fish'+target).show();

    filters.time = tmpTime;

    if($('.fish:visible').length <= 0) {
        $('#no-fish').show();
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

    $('#clock').removeClass().addClass(moment).html(`<span class="sprite-icon icon-${moment}"></span>`);
}

function initCompanion() {

    // Translation
    document.getElementById('title').textContent = t('app.title');
    document.getElementById('subtitle').textContent = t('app.subtitle');
    document.getElementById('no-fish').textContent = t('fishs.zero');
    document.getElementById('settingsTitle').textContent = t('settings.title');
    document.getElementById('settingsLanguageLabel').textContent = t('settings.language');
    document.getElementById('settingsGw2TokenLabel').textContent = t('settings.gw2token');
    document.getElementById('settingsClose').textContent = t('settings.close');
    document.getElementById('settingsSave').textContent = t('settings.save');

    maps.forEach(function(region) {

        achievementsIds.push(region.achievement_id);
        achievementsRepeatIds.push(parseInt(region.repeat_achievement_id));

        region.ids.forEach(function(id) {
            mapsIds[id] = region.achievement_id;
        });

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

            $('#fishs').append(`<div class="fish rarity-${fish.rarity}" 
            data-region="${region.achievement[lang]}" 
            data-fish="${fish.item_id}" 
            data-bait="${(bait) ? bait : t('baits.any')}" 
            data-spot="${(spot) ? spot : t('spots.any')}" 
            data-time="${((fish.time === '') ? 'a' : fish.time)}"
            data-achievement="${region.achievement_id}"
        >
            <div class="fish-icon sprite-icon icon-${fish.item_id}"></div>
            <div>
                <div class="name">${fish.name[lang]}</div>
                <div class="metas">
                    <span><span class="sprite-icon icon-map"></span>${region.achievement[lang]}</span>
                    ${(spot) ? `<span><span class="sprite-icon icon-water"></span>${spot}</span>` : ''}</span>
                    ${(bait) ? `<span><span class="sprite-icon icon-bait"></span>${bait}</span>` : ''}
                    ${(fish.power) ? `<span><span class="sprite-icon icon-power"></span>${fish.power}</span>` : ''}
                    ${(fish.time) ?  `<span><span class="sprite-icon icon-${(fish.time) ? fish.time : 'time'}"></span>${t('time.'+fish.time)}</span>` : ''}
                </div>
                <div class="metas">
                    
                </div>
                <div class="metas">
                    
                </div>
            </div>
        </div>`);
        });
    });


    $('#baits').append($('<option>', {
        value: '',
        text: t('baits.default')
    }));

    baits.push(t('baits.any'));
    baits.sort();
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
    spots.sort();
    spots.forEach(function(s) {
        $('#spots').append($('<option>', {
            value: s,
            text: s
        }));
    });
}

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
        }

        $('#gw2link').removeClass().addClass(res.status);
        filterFishs();
    }).fail(function() {
        $('#gw2link').removeClass().addClass('offline');
    });

    if(filters.map !== '0') {
        if(['1442', '1438', '1428', '1452', '1422'].indexOf(filters.map) >= 0) {
            updateClock('cantha');
        } else {
            updateClock('tyria');
        }
    } else {
        updateClock('tyria');
    }

    filterFishs();

}

window.addEventListener('load', (event) => {
    initCompanion();

    updateCompanion();
    setInterval(updateCompanion, 10000);

    if(token) {
        checkAchievementsFishs();
        setInterval(checkAchievementsFishs, 60000 * 3); // 3 minutes
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

let settingsLanguage = document.getElementById('settingsLanguage');
let settingsGw2Token = document.getElementById('settingsGw2Token');
settingsLanguage.value = lang;
settingsGw2Token.value = token;

settingsButton.addEventListener('click', function() {
    settingsPopup.classList.remove("hidden");
    app.classList.add("popup");
});

settingsClose.addEventListener('click', function(e) {
    e.preventDefault();
    settingsPopup.classList.add("hidden");
    app.classList.remove("popup");
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
                if(a.done) {
                    $('.fish[data-achievement="'+a.id+'"]').addClass('fish-done');
                } else {
                    a.bits.forEach(function(b) {
                        $('.fish[data-fish="'+achievementsData[a.id]['bits'][b]+'"]').addClass('fish-done');
                    })
                }
            }

            if(achievementsRepeatIds.indexOf(a.id) >= 0) {
                if(a.done) {
                    $('.fish[data-achievement="'+a.id+'"]').addClass('fish-done-repeat');
                } else {
                    a.bits.forEach(function(b) {
                        $('.fish[data-fish="'+achievementsData[a.id]['bits'][b]+'"]').addClass('fish-done-repeat');
                    })
                }
            }
        });
    });

}
