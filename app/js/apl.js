SC.initialize({
  client_id: "2dc324d4952e8c744781d8cb4f9d6f09",
});

var iframeElement = document.querySelector('iframe');
var widget = SC.Widget(iframeElement);
widget.load('https%3A//api.soundcloud.com/tracks/', {auto_play:false});

var resultId = 0;
var resultTrackIds = [];
var playlistId = 0;
var addedResultIds = [];
var playlistIds = [];
var shuffledPlaylistIds = [];

var nowPlaying = 0;
var playCount = 0;
var playbackState = 'pause';
var repeatMode = 'all';
var shuffleMode = 'off';
var volume = 1;
var preVolume = 1;
var searchMode = 'tracks';
var limitP = 50;
var limitT = 200;

$(function() {

  $('.icon_playlist').hide();
  $('#controller').hide();
  var UA = navigator.userAgent;
  if (UA.indexOf('iPhone')  != -1 || UA.indexOf('iPod') != -1 || UA.indexOf('iPad') != -1 || UA.indexOf('Android') != -1) {
    $('.volume_controller').hide();
  }

  $('#keyword').val('');

  $('#volume_icon').click(function() {
    if(volume != 0) {
      preVolume = volume;
      setVolume('0');
    }
    else {
      setVolume(preVolume);
    }
    return false;
  });

  $('#search_form').submit(function() {
    $('#result').text('Loading...');
    var keyword = $('#keyword').val();
    var searchLimit;
    if(searchMode == 'playlists') {
      searchLimit = limitP;
    }
    else{
      searchLimit = limitT;
      }

    if(keyword) {

      SC.get('/'+searchMode, { q:keyword, limit: searchLimit }, function(result, error) {

        $('#result').text('');

        if (error) {
          if (error.message.indexOf('HTTP Error') != -1) {
            $('#result').text('Too many results found');
          }
          else {
            $('#result').text(error.message);
          }
          return false;
        }

        if(result.length == 0) {
          $('#result').text('No results found');
          return false;
        }

        if(searchMode == 'playlists') {
          loadPlaylist(result);
        }
        else{
          loadTrack(result);
        }
      })
    }
    else {
      $('#result').text('');
    }
    moveTo('container', 'fast');
    return false;
  })

});

function loadPlaylist(result) {
  for(var i=0; i<result.length; i++) {
    var playlist = result[i];
    var playlistArtwork = loadArtwork(playlist.artwork_url);
    var playlistTitle = playlist.title;
    var trackCount = playlist.tracks.length;

    if(trackCount > 0) {
      $('#result').append('<div class="playlist"><div class="playlist_image">'+playlistArtwork+'</div><div class="playlist_title">'+playlistTitle+'</div><div class="add_playlist"><a href="javascript:void(0);" onclick="addPlaylist('+resultId+', '+trackCount+');">ADD ALL</a></div><div class="clear_float"></div></div>');

      for(var j=0; j<trackCount; j++) {
        var track = playlist.tracks[j];
        var trackId = track.id;
        var trackArtwork = loadArtwork(track.artwork_url);
        var trackTitle = track.title;
        var trackPlaybackCount = String(track.playback_count).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        var trackDuration = convertTime(track.duration);

        $('#result').append('<div class="track"><a href="javascript:void(0);" onclick="addAndPlay('+resultId+');"><div class='+resultId+'><div class="track_image">'+trackArtwork+'</div><div class="track_title">'+trackTitle+'<br /><span class="play_count"><span class="glyphicon glyphicon-play" aria-hidden="true"></span> '+trackPlaybackCount+'<span class="play_time">[ '+trackDuration+' ]<span></div></div></a><div class="add_track_btn"><a href="javascript:void(0);" onclick="addTrack('+resultId+');"><button type="button" id='+resultId+'_btn class="btn btn-default add_btn" title="Add"><span id='+resultId+'_icon class="glyphicon glyphicon-plus add_icon" aria-hidden="true"></span></button></a></div></div>');
        resultTrackIds.push(trackId);
        resultId++;
      }
      $('#result').append('<hr />');
    }
  }
}

function loadTrack(result) {
  var trackCount = result.length;

  $('#result').append('<div class="add_tracks"><a href="javascript:void(0);" onclick="addPlaylist('+resultId+', '+trackCount+');">ADD ALL</a></div>');

  for(var j=0; j<trackCount; j++) {
    var track = result[j];
    var trackId = track.id;
    var trackArtwork = loadArtwork(track.artwork_url);
    var trackTitle = track.title;
    var trackPlaybackCount = String(track.playback_count).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    var trackDuration = convertTime(track.duration);

    $('#result').append('<div class="track"><a href="javascript:void(0);" onclick="addAndPlay('+resultId+');"><div class='+resultId+'><div class="track_image">'+trackArtwork+'</div><div class="track_title">'+trackTitle+'<br /><span class="play_count"><span class="glyphicon glyphicon-play" aria-hidden="true"></span> '+trackPlaybackCount+'<span class="play_time">[ '+trackDuration+' ]<span></div></div></a><div class="add_track_btn"><a href="javascript:void(0);" onclick="addTrack('+resultId+');"><button type="button" id='+resultId+'_btn class="btn btn-default add_btn" title="Add"><span id='+resultId+'_icon class="glyphicon glyphicon-plus add_icon" aria-hidden="true"></span></button></a></div></div>');
    resultTrackIds.push(trackId);
    resultId++;
  }
  $('#result').append('<hr />');
}

function loadArtwork(url) {
  var artwork;
  if(url) {
    url = url.replace(/large/g, 'badge');
    artwork = '<img src='+url+' height="47" width="47">'; 
  }
  else {
    artwork = '<div class="blank_square"></div>';
  }
  return artwork;
}

function convertTime(duration) {
  var totalSecond = Math.floor(duration / 1000);
  var s = totalSecond % 60;
  if (s < 10) {
    s = '0'+s;
  }
  var m = Math.floor(totalSecond / 60) % 60;
  var h = Math.floor(totalSecond / 3600);
  if (h > 0 && m < 10) {
    m = '0'+m;
  }
  if(h == 0) {
    return m+':'+s;
  }
  else {
    return h+':'+m+':'+s;
  }
}

function addTrack(resultId) {
  $('#'+resultId+'_btn').attr('class', 'btn btn-default add_btn_selected');
  $('#'+resultId+'_icon').attr('class', 'glyphicon glyphicon-plus add_icon_selected');

  $('.icon_playlist').show();
  $('#controller').show();
  if(playlistIds.length == 0){
    $('#playlist').append('<h2 class="playlist_index"><span class="glyphicon glyphicon-th-list" aria-hidden="true"></span> Playlist</h2><div class="clear_tracks"><a href="javascript:void(0);" onclick="clearPlaylist();">CLEAR ALL</a></div>');
  }
  $('#playlist').append('<div id='+playlistId+' class="added_track"><a href="javascript:void(0);" onclick="jumpTrack('+playlistId+');" class="copied_'+playlistId+'"></a><div class="delete_track_btn"><a href="javascript:void(0);" onclick="deleteTrack('+playlistId+');"><button type="button" class="btn btn-default" title="Delete"><span aria-hidden="true" class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></a></div></div>');

  var copyTrack = $('#result').find('.'+resultId);
  $('.copied_'+playlistId).append(copyTrack.clone(true));

  addedResultIds.push(resultId);
  playlistIds.push(playlistId);
  shuffledPlaylistIds = shuffle(playlistIds);
  playlistId++;

  $('.icon_playlist').fadeOut(200,function(){$(this).fadeIn(200,function(){$(this).fadeOut(200,function(){$(this).fadeIn(200,function(){$(this).fadeOut(200,function(){$(this).fadeIn(200,function(){$(this).fadeOut(200,function(){$(this).fadeIn(200,function(){$(this).fadeOut(200,function(){$(this).fadeIn(200)})})})})})})})})});

  return false;
}

function addPlaylist(from, count) {
  for(var i=from; i<from+count; i++) {
    addTrack(i);
  }
  return false;
}

function deleteTrack(playlistId) {
  var deleteNum = playlistIds.indexOf(playlistId);
  playlistIds.splice(deleteNum, 1);
  shuffledPlaylistIds = shuffle(playlistIds);
  if(deleteNum < nowPlaying) {
    nowPlaying--;
  }

  $('#playlist').find('#'+playlistId).remove();

  if(playlistIds.length == 0) {
    $('.icon_playlist').hide();
    $('#playlist_area').find($('.playlist_index')).remove();
    $('#playlist_area').find($('.clear_tracks')).remove();
    if(playCount == 0) {
      $('#controller').hide();
    }
  }
  return false;
}

function clearPlaylist() {
  if(window.confirm('Clear Playlist?')) {
    $('#playlist').empty();
    $('.icon_playlist').hide();
    if(playCount == 0) {
      $('#controller').hide();
    }
    nowPlaying = 0;
    playlistIds.length = 0;
  }
  return false;
}

widget.bind(SC.Widget.Events.PLAY, function() {
  if(playbackState == 'pause') {
    $('#playbackButton').attr('class', 'glyphicon glyphicon-pause');
    playbackState = 'play';
  }
});

widget.bind(SC.Widget.Events.PAUSE, function() {
  if(playbackState == 'play') {
    $('#playbackButton').attr('class', 'glyphicon glyphicon-play');
    playbackState = 'pause';
  }
});

widget.bind(SC.Widget.Events.FINISH, function() {
  $('#playbackButton').attr('class', 'glyphicon glyphicon-play');
  playbackState = 'pause';
  if(playlistIds.length > 0) {
    if(repeatMode == 'song') {
      playTrack(nowPlaying);
    }
    else {
      nextTrack('auto');
    }
  }
});

widget.bind(SC.Widget.Events.PLAY, function() {
  setVolume(volume);
});

function changePlaybackState() {
  if(playbackState == 'pause') {
    if(playlistIds.length > 0 && nowPlaying == 0) {
      nowPlaying = 1;
      playTrack(nowPlaying);
    }
    else {
      widget.play();
    }
    $('#playbackButton').attr('class', 'glyphicon glyphicon-pause');
    playbackState = 'play';
  }
  else {
    widget.pause();
    $('#playbackButton').attr('class', 'glyphicon glyphicon-play');
    playbackState = 'pause';
  }
  return false;
}

function nextTrack(param) {  
  if(playlistIds.length > 0) {
    if(nowPlaying < playlistIds.length) {
      nowPlaying++;
      playTrack(nowPlaying);
    }
    else if (repeatMode == 'all' || param == 'force') {
      nowPlaying = 1;
      playTrack(nowPlaying);
    }
    else {
      $('#playbackButton').attr('class', 'glyphicon glyphicon-play');
      playbackState = 'pause';
    }
  }
  return false;
}

function prevTrack() {
  if(playlistIds.length > 0) {
    if(nowPlaying == 1) {
      nowPlaying = playlistIds.length;
    }
    else {
      nowPlaying--;
    }
    playTrack(nowPlaying);
  }
  return false;
}

function changeRepeatMode() {
  switch(repeatMode) {
    case 'all':
      $('#repeat').append('<span class="repeat_song">1</span>');
      $('#repeat_btn').attr('title', 'Repeat song');
      repeatMode = 'song';
      break;
    case 'song':
      $('.repeat_song').remove();
      $('#repeat').attr('class', 'glyphicon glyphicon-retweet repeat_icon_off');
      $('#repeat_btn').attr('title', 'Repeat off');
      repeatMode = 'off';
      break;
    case 'off':
      $('#repeat').attr('class', 'glyphicon glyphicon-retweet repeat_icon_on');
      $('#repeat_btn').attr('title', 'Repeat all');
      repeatMode = 'all';
      break;
    default:
      break;
  }
  return false;
}

function changeShuffleMode() {
  if(shuffleMode == 'off') {
      $('#shuffle').attr('class', 'glyphicon glyphicon-random shuffle_icon_on');
      $('#shuffle_btn').attr('title', 'Shuffle on');
      shuffleMode = 'on';
      shuffledPlaylistIds = shuffle(playlistIds);
  }
  else {
      $('#shuffle').attr('class', 'glyphicon glyphicon-random shuffle_icon_off');
      $('#shuffle_btn').attr('title', 'Shuffle off');
      shuffleMode = 'off';
  }
  return false;
}

function shuffle(ary) {
  var shuffleAry = ary.slice(0);
  var i = shuffleAry.length;
  while(i) {
    var j = Math.floor(Math.random() * i);
    var k = shuffleAry[--i];
    shuffleAry[i] = shuffleAry[j];
    shuffleAry[j] = k;
  }
  return shuffleAry;
}

function playTrack(nowPlaying) {
  if(shuffleMode == 'on') {
    var targetPlaylistId = shuffledPlaylistIds[--nowPlaying];
  }
  else {
    var targetPlaylistId = playlistIds[--nowPlaying];
  }
  var targetAddedResultId = addedResultIds[targetPlaylistId];
  var targetResultTrackId = resultTrackIds[targetAddedResultId];

  widget.load('https%3A//api.soundcloud.com/tracks/'+targetResultTrackId, {auto_play:true});

  $('#cover').hide();

  $('#playbackButton').attr('class', 'glyphicon glyphicon-pause');
  playbackState = 'play';

  $('.added_track').attr('class', 'added_track'); //background reset
  $('#'+targetPlaylistId).attr('class', 'added_track playing');

  playCount++;
}

function setVolume(num) {
  if(num == 0) {
    $('#volume_icon').attr('class', 'glyphicon glyphicon-volume-off');
  }
  else if(num < 0.6) {
    $('#volume_icon').attr('class', 'glyphicon glyphicon-volume-down');
  }
  else {
    $('#volume_icon').attr('class', 'glyphicon glyphicon-volume-up');
  }

  widget.setVolume(num);
  volume = num;

  for(var i=1; i<=10; i++) {
    $('#v'+i).attr('class', 'volume_in');
  }

  var target = num * 10 + 1;
  for(var j=target; j<=10; j++) {
    $('#v'+j).attr('class', 'volume_out');
  }
}

function addAndPlay(id) {
  addTrack(id);
  nowPlaying = playlistIds.length;
  playTrack(nowPlaying);
  return false;
}

function jumpTrack(id) {
  if(shuffleMode == 'off') {
    nowPlaying = playlistIds.indexOf(id)+1;
  }
  else {
    nowPlaying = shuffledPlaylistIds.indexOf(id)+1;
  }
  playTrack(nowPlaying);
  return false;
}

function moveTo(id, speed) {
  var target = $('#'+id).offset().top;
  $('html, body').animate({ scrollTop: target }, speed);
  return false;
}

function changeSearchMode(search) {
  switch(search) {
    case 'track':
      $('#dropdown_menu').empty();
      $('#dropdown_menu').append('<span class="glyphicon glyphicon-search" aria-hidden="true"></span> Search Track');
      searchMode = 'tracks';
      break;
    case 'playlist':
      $('#dropdown_menu').empty();
      $('#dropdown_menu').append('<span class="glyphicon glyphicon-search" aria-hidden="true"></span> Search Playlist');
      searchMode = 'playlists';
    default:
      break;
  }
  return false;
}
