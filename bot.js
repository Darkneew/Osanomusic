//INITIALISATION 
const Discord = require('discord.js');
const fs = require('fs')
const prefix = "§";
const token = 'insert discord token';
const bot = new Discord.Client();
bot.login(token);
const ffmpeg = require('ffmpeg');
const YouTube = require('youtube-node');
const ytdl = require('ytdl-core');
var streamOptions = { seek: 0, volume: 1 };
var youTube = new YouTube();
youTube.setKey('insert youtube token');
bot.on('ready', () => {
    console.log("Alleluia it is working")
    bot.user.setActivity("some music", {type: 2});
});
var queue = [];
var Dispatcher;

//function play music
function stream(Turl, message, connection) {
    const Tstream = ytdl(Turl);
        Dispatcher = connection.playStream(Tstream, streamOptions).on("end", () => {
            if (queue.length >= 1) {
                var Aobj = queue.shift();
                stream(Aobj[0], message, connection);
                message.channel.send('Now playing ' + Aobj[1])
            }
            else {
                message.channel.send('No music in the queue, leaving the channel.')
                let Me = message.guild.members.find("user", bot.user)
                Me.voiceChannel.leave();
            }
        })
}

//FONCTION RECHERCHE 
function findUrl (Sname) {
    if (Sname.startsWith('www.youtube.com/watch?v=')||Sname.startsWith('https://www.youtube.com/watch?v=')) {
        let id = Sname.split('/watch?v=').splice(1).join('/watch?v=')
        var promise1 = new Promise((resolve, reject) => {youTube.getById(id, function(error, Tresult) {
            if (error) {
              console.log(error);
            }
            else {
                let Mname =  Tresult.items[0].snippet.title || Tresult.items[1].snippet.title;
                resolve([Sname, Mname]);
            }
          })});
          return promise1;
        }
        else {
            var promise1 = new Promise( (resolve, reject) => {
            youTube.search(Sname , 2, function(error, result) {
            if (error) {
                console.log(error);
            }
            else {
                let Tresult = JSON.parse(JSON.stringify(result, null, 2));
                let videoId = Tresult.items[0].id.videoId || Tresult.items[1].id.videoId;
                var Turl = 'https://www.youtube.com/watch?v=' + videoId;
                var Mname =  Tresult.items[0].snippet.title || Tresult.items[1].snippet.title;
                resolve([Turl, Mname]);
            }
            })})
            return promise1;
        };
        
}

bot.on('message', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.guild) return;
    let messageWprefix = message.content.split("").splice(2).join("")
    let Me = message.guild.members.find("user", bot.user)
    //SEARCH
    if (messageWprefix.startsWith('search')) {
        let name = messageWprefix.split(" ").splice(1).join(" ")
        if (!name) return message.channel.send('Search something, it is usually more useful');
        youTube.search(name , 2, function(error, result) {
            if (error) {
              console.log(error);
            }
            else {
                let Tresult = JSON.parse(JSON.stringify(result, null, 2));
                let videoId = Tresult.items[0].id.videoId || Tresult.items[1].id.videoId 
                let url = 'https://www.youtube.com/watch?v=' + videoId
                message.channel.send(url)
            }
          });
    }
    //CLEAR
    else if (messageWprefix.startsWith('clear')) {
        if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Don't mess up with big things, little fella, they might fall on you :confused:");
        let deleteNumberstr = message.content.split(" ").slice(1);
        let deleteNumber = parseInt(deleteNumberstr, 10);
        if (!deleteNumber) {
            let arrprefix = message.content.split("d");
            message.channel.send("This is the wrong way to delete a chat history :weary:\nYou should do : " + arrprefix[0] + "clear [number of message to delete]\nAlso, values under 1 are not accepted, *logic*");
            return;
        }
        if ((deleteNumber <= 0)||(deleteNumber>100)) { 
            message.channel.send("This is the wrong way to delete a chat history :weary:\nYou should choose a number between 1 and 100")
        }
        else {
        message.channel.bulkDelete(deleteNumber);
        }
    }
    //HELP
    else if (messageWprefix.startsWith('help basic')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('OSANOMUSIC - PREFIX : !!')
        .setTitle("basic commands:")
        .addField("!!play [song name or url]","To play a music, if it is not already playing some")
        .addField("!!search [song name]","To get the url of a specific song according to its name")
        .addField("!!skip", "To skip a music")
        .addField("!!stop", "To stop all music and clear the queue")
        .addField("!!help","To get help :)")
        .addField("!!clear [number]","To clear a certain number of messages, between 1 and 100")
        .addField("!!ping","To get my ping")
        message.channel.send(serverembed);
    } 
    else if (messageWprefix.startsWith('help queue')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('OSANOMUSIC - PREFIX : !!')
        .setTitle("queue commands:")
        .addField("!!queue display","To display the current queue")
        .addField("!!stop", "To clear the queue (stop also the music)")
        .addField("!!queue add [song name or url]", "To add a song to the queue")
        .addField("!!playlist queue [playlist name]","To add a playlist to the queue")
        message.channel.send(serverembed);
    }
    else if (messageWprefix.startsWith('help playlist')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('OSANOMUSIC - PREFIX : !!')
        .setTitle("playlist commands:")
        .addField("!!playlist display [playlist name]","To display musics, author and rights of a playlist")
        .addField("!!playlist list [mention user (optional)]","To display a list of all existing playlists. Mention someone to get his playlists")
        .addField("!!playlist create [open | closed] [playlist name]", "To create a new playlist. If open, anyone can modify it.")
        .addField("!!playlist add [song name or url]", "To add a song to the playlist")
        .addField("!!playlist queue [playlist name]","To add a playlist to the queue")
        message.channel.send(serverembed);
    }
    else if (messageWprefix.startsWith('help')) {
        let serverembed = new Discord.RichEmbed()
        .setColor(Math.floor(Math.random() * 16777214) + 1)
        .setAuthor('OSANOMUSIC - PREFIX : !!')
        .setTitle("commands:")
        .addField("basic commands","type `!!help basic` to get help on basic stuff")
        .addField("playlist commands", "type `!!help playlist` to get help on playlist system")
        .addField("queue commands", "type `!!help queue` to get help on queue system")
        message.channel.send(serverembed);
    }
    //PING
    else if (messageWprefix.startsWith('ping')) {
        message.channel.send('Pinging...')
        let pings = bot.pings
        pings.forEach(ping => {
            message.channel.send(`:o: ${ping}`)
        });
    }

    //Display Queue
    else if (messageWprefix.startsWith('queue display')) {
        if (queue.length < 1) return message.channel.send('There is no queue :/');
        message.channel.send('Here are the musics in queue right now :')
        queue.forEach(obj => {
            message.channel.send(`- ${obj[1]}`)            
        });
    }
    //CREATE playlist
    else if (messageWprefix.startsWith('playlist create')) {
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        let Trights = messageWprefix.split(' ')[2]
        if (!(Trights == 'open' || Trights == 'closed')) return message.channel.send(`Sorry, this is a wrong utilisation! You should do \`\`\`${prefix}create playlist [open | closed] [name]\`\`\``);
        let name = messageWprefix.split(' ').splice(3).join(" ");
        if (!name) return message.channel.send(`Sorry, this is a wrong utilisation! You should do \`\`\`${prefix}create playlist [open | closed] [name]\`\`\``);
        if (name.indexOf(' ') >= 0 ) return message.channel.send('Sorry, the name can only be one word');
        if (playlists[name]) return message.channel.send('A playlist of this name already exist');
        playlists[name] = {
            author : message.author.id,
            musics : [],
            rights : Trights
            };
        fs.writeFile("./playlists.json", JSON.stringify(playlists), (x) => {
            if (x) console.error(x)
          });
        message.channel.send(`Well done, you have created a playlist named ${name}`)
    }
    //QUEUE ADD
    else if (messageWprefix.startsWith('queue add')) {
        let Aname = messageWprefix.split(' ').splice(2).join(' ');
        if ((!message.member.voiceChannel)&&(!Me.voiceChannel)) return message.channel.send('You\'re not even in a voice Channel!');
        let promise = findUrl(Aname);
        promise.then( (obj) => {
            queue.push(obj);
            message.channel.send('Successffully added `' + obj[1] + '` to the queue');
            if (!Me.voiceChannel) {
                message.member.voiceChannel.join()
                .then(connection => { 
                message.channel.send('I have successfully connected to your channel!');
                var Aobj = queue.shift();
                stream(Aobj[0], message, connection);
                message.channel.send('Now playing ' + Aobj[1]);
            })}
        })
    }
    //PLAYLIST ADD
    else if (messageWprefix.startsWith('playlist add')) {
        let playlistName = messageWprefix.split(' ')[2];
        if (!playlistName) return message.channel.send(`Was that a joke? You need to enter \`\`\`${prefix}playlist add [playlist name] [music name or link]\`\`\``)
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        if (!playlists[playlistName]) message.channel.send('This playlist doesn\'t exist');
        let rights = playlists[playlistName].rights;
        if (rights != 'open') {
            if(playlists[playlistName].author != message.author.id) return message.channel.send('You don\'t have the right to write in this playlist')
        }
        let name = messageWprefix.split(" ").splice(3).join(" ")
        if (!name) return message.channel.send('Try adding something, it is usually more useful');
        let promise = findUrl(name);
        promise.then( (obj) => {
        let Fobj = {
            url : obj[0],
            name:obj[1]
        }
        playlists[playlistName].musics.push(Fobj);
        fs.writeFile("./playlists.json", JSON.stringify(playlists), (x) => {
            if (x) console.error(x)
          });
        message.channel.send(`You have added the music named \`${obj[1]}\` to the playlist, well done!`)})
    }
    //PLAYLIST LIST
    else if (messageWprefix.startsWith('playlist list')) {
        let User = message.mentions.users.first();
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        if (User) {
            message.channel.send('Here are a list of all playlists made by ' + User.username + ' :');
            for (var key in playlists) {
                if (playlists[key].author == User.id) message.channel.send(`- ${key}`)
            }
            return
        }
        message.channel.send('Here are a list of all playlists :');
        for (var key in playlists) {
            message.channel.send(`- ${key}`)
        }
    }
    //DISP PLAYLIST
    else if (messageWprefix.startsWith('playlist display')) {
        let Pname = messageWprefix.split(' ')[2];
        if (!Pname) return message.channel.send('Please precise a playlist')
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        if (!playlists[Pname]) return message.channel.send('This playlist doesn\'t exist');
        let playlist = playlists[Pname].musics;
        let id = playlists[Pname].author;
        let rights = playlists[Pname].rights;
        let user = bot.users.find('id', id).username;
        message.channel.send(`The author of this playlist is ${user}\n`);
        message.channel.send(`The rights on this playlist are ${rights}\n`);
        message.channel.send('Here are the musics in this playlist :')
        playlist.forEach(music => {
            message.channel.send(' - ' + music.name);
        });
    }
    //SKIP
    else if (messageWprefix.startsWith('skip')) {
        if (!Dispatcher) return message.channel.send('Nothing to skip');
        Dispatcher.end();
    }
    //STOP
    else if (messageWprefix.startsWith('stop')) {
        if (!Dispatcher) return message.channel.send('Nothing to skip');
        queue = []
        Dispatcher.end();
    }
    //PLAYLIST QUEUE
    else if (messageWprefix.startsWith('playlist queue')) {
        if ((!message.member.voiceChannel)&&(!Me.voiceChannel)) return message.channel.send('You\'re not even in a voice Channel!');
        let playlistName = messageWprefix.split(' ').splice(2)[0];
        if (!playlistName) return message.channel.send('Please specifie the name of the playlist you want to queue');
        let playlists = JSON.parse(fs.readFileSync("./playlists.json", "utf8"));
        if (!playlists[playlistName]) return message.channel.send('This playlist doesn\'t exist');
        let playlist = playlists[playlistName].musics;
        playlist.forEach(music => {
            let Nobj = [music.url, music.name];
            queue.push(Nobj);
            message.channel.send(`\`${music.name}\` added to the queue`)
        });
        if (!Me.voiceChannel) {
            message.member.voiceChannel.join()
            .then(connection => { 
            message.channel.send('I have successfully connected to your channel!');
            var Aobj = queue.shift();
            stream(Aobj[0], message, connection);
            message.channel.send('Now playing ' + Aobj[1]);
        })}
    }
    //PLAY
    else if (messageWprefix.startsWith('play ')) {
        if (!message.member.voiceChannel) return message.channel.send('You\'re not even in a voice Channel!');
        if (Me.voiceChannel) {
            if (Me.voiceChannel != message.member.voiceChannel) return message.channel.send('Sorry, I\'m already in another voice channel')
            message.channel.send('I\'m already playing something. \nIf you want to play your song next, just type in `!!queue add [song]`\nIf you want to erase the queue and play your music now, just do `!!stop` then redo this command again.')
        } else {
        message.member.voiceChannel.join()
        .then(connection => { 
            message.channel.send('I have successfully connected to your channel!');
        let name = messageWprefix.split(" ").splice(1).join(" ")
        if (!name) return message.channel.send('Try playing actually something, it is usually more useful');
        if (name.startsWith('www.youtube.com/watch?v=')||name.startsWith('https://www.youtube.com/watch?v=')) {
            stream(name, message, connection);
            message.channel.send('Successfully playing it')
        }
        else {
            youTube.search(name , 2, function(error, result) {
            if (error) {
                console.log(error);
            }
            else {
                let Tresult = JSON.parse(JSON.stringify(result, null, 2));
                let videoId = Tresult.items[0].id.videoId || Tresult.items[1].id.videoId 
                let Turl = 'https://www.youtube.com/watch?v=' + videoId;
                let vc = message.guild.me.voiceChannel;
                vc.leave();
                vc.join().then(cnt => {
                    stream(Turl, message, cnt);
                    message.channel.send(`Successfully playing it`)
                })
            }
        });
        }
    })
    .catch(console.log);}}
    else {
        return message.channel.send('Sorry, I wasn\'t aware of this command');
    }
});