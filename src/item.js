import { Map } from 'extendable-immutable'

class Item extends Map{
    get groupId(){
        return this.get('_groupId_');
    }

    referencingItemKeys(){
        return this.keySeq().filter((key) => {
            return key.endsWith('_') && !key.startsWith('_');
        });
    }
}

export default Item;