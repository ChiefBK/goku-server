import {Map as MapExtendable} from 'extendable-immutable'
import {Map} from 'immutable';
import {getItem} from '../core';
import {List} from 'immutable';
import winston from 'winston';
import {pretty} from '../util';

class Item extends MapExtendable {
    get groupId() {
        return this.get('groupId');
    }

    referencingItemKeys() {
        return this.keySeq().filter((key) => {
            return key.endsWith('_') && !key.startsWith('_');
        });
    }

    matchesQuery(query) {
        let isMatching = true;

        for (let key in query['properties']) {
            const attributeRegEx = new RegExp(query['properties'][key]); // Create regex expression with value of property
            if (!this.has(key) || !attributeRegEx.test(this.get(key))) { // If item does not have key or does not match regex
                isMatching = false;
                break;
            }
            else if (key == 'hash' && item.get(key) == query['properties'][key]) {
                isMatching = false;
                break;
            }
        }

        return isMatching;
    }

    //TODO - use one list with pointer
    referencingItems(state, levels = -1, queue = List.of(this), results = List()) {
        if (levels == 0) {
            queue.forEach((item) => {
                results = results.push(item);
            });
            return results.rest();
        }
        winston.silly(levels);
        let item = queue.first();
        winston.silly(`item: ${pretty(item.toJS())}`);
        item.referencingItemKeys().forEach((key) => {
            const itemId = item.get(key);
            queue = queue.push(getItem(state, itemId));
        });

        results = results.push(item);
        queue = queue.shift();

        if (queue.size == 0) {
            return results.rest();
        }

        return this.referencingItems(state, --levels, queue, results);
    }
}

export default Item;