import "../sass/style.scss";
import $ from 'jquery';

import {maps} from './data';


const lang = 'fr';
const _times = {
    'd': 'Jour',
    'n': 'Nuit',
    'dd': 'Aube/Crépuscule'
};


let spots = [];
let baits = [];
let mapsIds = [];

let filters = {
    'map': '',
    'bait': '',
    'spot': '',
    'time': '',
};

$(document).on('change', 'select', function(e) {
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

    console.log(target);
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
    const t = parseInt((date.getUTCHours()%2).toString() + (date.getUTCMinutes()).toString());

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
    maps.forEach(function(region) {

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
            data-bait="${(bait) ? bait : 'Indéfini'}" 
            data-spot="${(spot) ? spot : 'Indéfinie'}" 
            data-time="${((fish.time === '') ? 'a' : fish.time)}"
            data-achievement="${region.achievement_id}"
        >
            <div class="fish-icon sprite-icon icon-${fish.item_id}"></div>
            <div>
                <div class="name">${fish.name[lang]}</div>
                <div class="metas">
                    <span><span class="sprite-icon icon-map"></span>${region.achievement[lang]}</span>
                    ${(spot) ? `<span><span class="sprite-icon icon-water"></span>${spot}</span>` : ''}</span>
                    ${(fish.power) ? `<span><span class="sprite-icon icon-power"></span>${fish.power}</span>` : ''}
                </div>
                <div class="metas">
                    ${(bait) ? `<span><span class="sprite-icon icon-bait"></span>${bait}</span>` : ''}
                    ${(fish.time) ?  `<span><span class="sprite-icon icon-${(fish.time) ? fish.time : 'time'}"></span>${_times[fish.time]}</span>` : ''}
                </div>
            </div>
        </div>`);
        });
    });

    baits.push('Indéfini');
    baits.sort();
    baits.forEach(function(b) {
        $('#baits').append($('<option>', {
            value: b,
            text: b
        }));
    });

    spots.push('Indéfinie');
    spots.sort();
    spots.forEach(function(s) {
        $('#spots').append($('<option>', {
            value: s,
            text: s
        }));
    });
}

function updateCompanion() {

    $.getJSON('http://127.0.0.1:8428/gw2.json', function(res) {

        console.log(res.identity.map_id);
        console.log(res);

        if(res.identity.map_id !== filters.map) {
            filters.map = res.identity.map_id;
            filters.bait = '';
            filters.spot = '';
            $("#spots").val("");
            $("#baits").val("");
        }

        $('#gw2link').removeClass().addClass((res.status == 'Not Linked to GW2') ? 'offline' : 'online');
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

initCompanion();

updateCompanion();
setInterval(updateCompanion, 10000);

