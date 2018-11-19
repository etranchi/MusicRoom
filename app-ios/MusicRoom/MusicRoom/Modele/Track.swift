//
//  Track.swift
//  MusicRoom
//
//  Created by Etienne TRANCHIER on 10/26/18.
//  Copyright © 2018 Etienne Tranchier. All rights reserved.
//

import Foundation


struct Track : Codable {
    var id : Int
    let readable : Bool
    let link : String?
    let album : Album?
    let artist : Artist?
    let title : String
    let duration : Int
}

struct AlbumTrack: Codable {
    let id : Int
    let readable : Bool
    let title : String
    let duration : Int
}

struct AlbumTrackData: Codable {
    let data : [AlbumTrack]
}

struct TrackData: Codable {
    let data : [Track]
}
