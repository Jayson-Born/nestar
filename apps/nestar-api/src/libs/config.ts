import { ObjectId } from "bson";

export const availableAgentsSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMembersSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];

export const availableOptions = ['propertyBarter', 'propertyRent'];
export const availablePropertySorts = [
    'createdAt',
    'updatedAt',
    'propertyViews',
    'propertyLikes',
    'propertyRank',
    'propertyPrice'
];

 /** IMAGE CONFIGURATION **/ 
 import { v4 as uuidv4 } from 'uuid';
 import * as path from 'path';
import { T } from "./types/common";
 
 export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
 export const getSerialForImage = (filename: string) => {
     const ext = path.parse(filename).ext;
     return uuidv4() + ext;
 };

export const shapeIntoMongoObjectId = (target: any) => {
    return typeof target === 'string' ? new ObjectId(target) : target;
};

export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = "$_id") => {

    return{
        $lookup: {  
            from: 'likes',
            let: {
                localLikeRefId:targetRefId,
                localMemberId: memberId,
                localMyFavourite: true,
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                {
                                    $eq: ["$likeRefId", "$$localLikeRefId"]}, { $eq: ["$memberId", "$$localMemberId"] }]
                        }

                        },
                },
                {
                    $project: {
                        _id: 0,
                        likeRefId: 1,
                        memberId: 1,
                        myFavourite: "$$localMyFavourite",
                    }
                }
            ],
            as: 'meLiked',
    }
 }
}


export const lookupMember = {
    $lookup: {
        from: 'members',
        localField: 'memberId',
        foreignField: '_id',
        as: 'memberData',
    }}

    export const lookupFollowingData = {
        $lookup: {
            from: 'members',
            localField: 'memberId',
            foreignField: '_id',
            as: 'followingData',
        }
    
    }; 
    
    export const lookupFollowerData = {
        $lookup: {
            from: 'members',
            localField: 'memberId',
            foreignField: '_id',
            as: 'followerData',
        }
    };
    
