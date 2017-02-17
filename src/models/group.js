import { Map } from 'extendable-immutable'

class Group extends Map{
    get id(){
        return this.group.get('id');
    }
}

export default Group;