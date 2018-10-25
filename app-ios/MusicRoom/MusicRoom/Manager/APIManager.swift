//
//  APIManager.swift
//  MusicRoom
//
//  Created by Etienne TRANCHIER on 10/25/18.
//  Copyright © 2018 Etienne Tranchier. All rights reserved.
//

import UIKit

class APIManager: NSObject {
    let ip : String = "192.168.99.100"
    let token : String? = nil
    
    func getMusic() -> [NSDictionary] {
        let url : String = "https://\(ip):4242/track"
        var request = URLRequest(url: URL(string: url)!)
        request.httpMethod = "GET"
        // request.setValue("Bearer " + token!, forHTTPHeaderField: "Authorization")
        let ret = request.execute()
        print(ret)
        return ret
    }
    
}

extension URLRequest {
    func    execute() -> [NSDictionary] {
        var dictionnary : [NSDictionary] = []
        var requestTokenDone : Bool = false
        let task = URLSession.shared.dataTask(with: self) {
            (data, response, error) in

            if let err = error {
                print("task session error: \(err)")
            } else if let d = data {
                do {
                    if let dic : [NSDictionary] = try JSONSerialization.jsonObject(with: d, options: JSONSerialization.ReadingOptions.mutableContainers) as? [NSDictionary] {
                        dictionnary = dic
                    } else if let dic : NSDictionary = try JSONSerialization.jsonObject(with: d, options: JSONSerialization.ReadingOptions.mutableContainers) as? NSDictionary {
                        dictionnary.append(dic)
                    } else {
                        print("task dictionnary error: failed")
                    }
                } catch (let err) {
                    print("task dictionnary error: \(err)")
                }
            } else {
                print("nodata")
            }
            requestTokenDone = true;
        }
        task.resume()
        
        //wait for task to terminate, making async useless
        repeat {
            RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.1))
        } while !requestTokenDone
        
        return (dictionnary)
    }
}
