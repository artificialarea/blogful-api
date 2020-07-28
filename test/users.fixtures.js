function makeUsersArray() {
    return [
        {
            id: 1,
            fullname: 'Lorem Ispum',
            username: 'loremipusm@gmail.com',
            password: 'secret',
            nickname: '',
            date_created: '2029-12-22T16:28:32.615Z'
            
        },
        {
            id: 2,
            fullname: 'Duis Autem',
            username: 'duisautem@shire.com',
            password: 'secret',
            nickname: 'duis',
            date_created: '2100-12-22T16:28:32.615Z'
            
        },
        {
            id: 3,
            fullname: 'No Lo So',
            username: 'noloso@hotmail.com',
            password: 'secret',
            nickname: 'nolo',
            date_created: '2029-12-22T16:28:32.615Z'
            
        },
    ];
};

module.exports = {
    makeUsersArray
}