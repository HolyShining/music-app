import graphene
from graphene_django import DjangoObjectType
from users.schema import UserType
from graphql import GraphQLError
from django.db.models import Q

from tracks.models import Track, Like


class TrackType(DjangoObjectType):
    class Meta:
        model = Track


class LikeType(DjangoObjectType):
    class Meta:
        model = Like


class CreateTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        title = graphene.String()
        description = graphene.String()
        url = graphene.String()

    def mutate(self, info, title, description, url):
        user = info.context.user
        if user.is_anonymous:
            raise GraphQLError('Log in required')
        track = Track(title=title,
                      description=description,
                      url=url,
                      posted_by=user)
        track.save()
        return CreateTrack(track=track)


class UpdateTrack(graphene.Mutation):
    track = graphene.Field(TrackType)

    class Arguments:
        track_id = graphene.Int(required=True)
        title = graphene.String()
        description = graphene.String()
        url = graphene.String()

    def mutate(self, info, track_id, title=None, description=None, url=None):
        user = info.context.user
        try:
            track = Track.objects.get(id=track_id)
        except Track.DoesNotExist:
            raise GraphQLError('This track does not exist')

        if track.posted_by != user:
            raise GraphQLError('Not permitted to update this track.')

        track.title = title or track.title
        track.description = description or track.description
        track.url = url or track.url
        track.save()
        return UpdateTrack(track=track)


class DeleteTrack(graphene.Mutation):
    track_id = graphene.Int()
    status = graphene.String()

    class Arguments:
        track_id = graphene.Int(required=True)

    def mutate(self, info, track_id):
        track = Track.objects.get(id=track_id)
        if track.posted_by != info.context.user:
            raise GraphQLError('Not permitted to update this track.')
        track.delete()
        return DeleteTrack(track_id=track_id, status='success')


class CreateLike(graphene.Mutation):
    user = graphene.Field(UserType)
    track = graphene.Field(TrackType)

    class Arguments:
        track_id = graphene.Int(required=True)

    def mutate(self, info, track_id):
        user = info.context.user
        track = Track.objects.get(id=track_id)

        if not track:
            raise GraphQLError('Cannot find track with given id')
        if user.is_anonymous:
            raise GraphQLError('Log in to like this song')

        Like.objects.get_or_create(user=user, track=track)
        return CreateLike(user=user, track=track)


class DeleteLike(graphene.Mutation):
    status = graphene.String()

    class Arguments:
        track_id = graphene.Int()

    def mutate(self, info, track_id):
        try:
            track = Like.objects.get(track_id=track_id, user=info.context.user)
            track.delete()
            print('deleted');
            return DeleteLike(status='OK')
        except Like.DoesNotExist:
            GraphQLError('User didn\'t like this song')


class Mutation(graphene.ObjectType):
    create_track = CreateTrack.Field()
    update_track = UpdateTrack.Field()
    delete_track = DeleteTrack.Field()
    create_like = CreateLike.Field()
    delete_like = DeleteLike.Field()


class Query(graphene.ObjectType):
    tracks = graphene.List(TrackType, search=graphene.String())
    likes = graphene.List(LikeType)

    def resolve_tracks(self, info, search=None):
        if search:
            filter = (
                    Q(title__icontains=search) |
                    Q(description__icontains=search)
            )
            return Track.objects.filter(filter)
        return Track.objects.all()

    def resolve_likes(self, info):
        return Like.objects.all()
