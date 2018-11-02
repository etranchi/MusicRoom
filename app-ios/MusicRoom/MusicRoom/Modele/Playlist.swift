//
//  Playlist.swift
//  MusicRoom
//
//  Created by Etienne TRANCHIER on 10/26/18.
//  Copyright © 2018 Etienne Tranchier. All rights reserved.
//

import Foundation

struct Creator : Decodable {
    let id : Int
    let name : String
    let tracklist : String
    let type : String
}


struct SPlaylist : Decodable {
    let data : [Playlist]
}

struct Playlist : Decodable {
    let id : Int
    let title : String
    // let collaborative : Bool
    let picture : String
    let tracklist : String
    let tracks : STrack?
}
