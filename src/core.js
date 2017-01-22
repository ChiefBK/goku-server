import {List, Map, toJS} from 'immutable';
import {generateId} from '../seed';
import pluralize from 'pluralize';
import Promise from 'bluebird';
import winston from 'winston';
import {pretty} from './util';

export const INITIAL_STATE_MAP = Map();

function indexById(iterable) {
    return iterable.reduce(
        (lookup, item) => lookup.set(item.get('id'), item),
        Map()
    );
}

function readFromState(query, state) {
    winston.debug(`Reading from state with query ${pretty(query)}`);
    return state.get(pluralize(query.model)).filter((item) => {
        winston.silly(`Testing query against item ${pretty(item.toJS())}`);
        let isMatching = true;

        for (let key in query['properties']) {
            const attributeRegEx = new RegExp(query['properties'][key]); // Create regex expression with value of property
            if (item.get(key) == null || !attributeRegEx.test(item.get(key))) { // If item does not have key or does not match regex
                isMatching = false;
                break;
            }
            else if(key == 'hash' && item.get(key) == query['properties'][key]) {

            }
        }

        return isMatching;
    });
}

function getById(id, state) {
    winston.debug("Getting by id: " + id);
    const item = state.getIn(['items', id]);
    if (item == null){
        return List();
    }
    else{
        return List([item]);
    }

    return state.getIn(['items', id]);
}

function getByIdAndHash(id, hash, state){
    winston.debug("Getting by id: " + id + " and hash: " + hash);
    const item = state.getIn(['items', id]);

    if (item == null || item.get('hash') == hash){
        return List();
    }
    else{
        return List([item]);
    }

}

function getInnerObjects(results, state, levels = 0, queue = []) {
    if (results === undefined || results.size == 0) {
        return List();
    }

    let lastResult = results.last();
    if(!lastResult.get('visited', false)){ //If lastResult does not have 'visited' attribute
        lastResult.keySeq().forEach((key) => {
            if(key.includes('ID')){
                let model = key.split('ID')[0];
                queue.push({
                    id: lastResult.get(key),
                    model: model
                });
            }
        });

        lastResult.set('visited', true);
    }

    if(queue.length == 0 || levels == 1){
        return results;
    }

    winston.silly(`Results ${pretty(results.toJS())}`);
    let newResults = results.push(getById(queue[0]['id'], state).first());
    winston.silly(`New Results ${pretty(newResults.toJS())}`);
    queue.shift();
    return getInnerObjects(newResults, state, --levels, queue);
}

export function retrieveQuery(query, state) {
    return new Promise((resolve, reject) => {
        let firstRoundResults;
        if (isGetByIdQuery(query)){
            firstRoundResults = getById(query.properties.id, state);
        }
        else if (isGetByIdAndHashQuery(query)) {
            firstRoundResults = getByIdAndHash(query.properties.id, query.properties.hash, state);
        }
        else{
            firstRoundResults = readFromState(query, state);
        }
        winston.silly(`results after first round had length of ${firstRoundResults.size}`);
        winston.silly(`first round results: ${pretty(firstRoundResults.toJS())}`);

        let allResults = getInnerObjects(firstRoundResults, state, 'levels' in query ? query.levels : undefined);

        resolve(allResults);
    });
}

function isGetByIdQuery(query){
    return 'id' in query['properties'] && Object.keys(query['properties']).length == 1
}

function isGetByIdAndHashQuery(query) {
    return 'id' in query['properties'] && 'hash' in query['properties'] && Object.keys(query['properties']).length == 2
}