create or replace schema videohost collate utf8mb4_unicode_ci;
use videohost;

create or replace table user
(
    id            int unsigned auto_increment
        primary key,
    login         varchar(32)  default '' not null,
    nickname      varchar(32)  default '' not null,
    url_avatar    varchar(100)            null,
    firstname     varchar(32)  default '' not null,
    secondname    varchar(32)  default '' not null,
    email         varchar(255) default '' not null,
    sha_pass_hash varchar(40)  default '' not null,
    constraint user_email_uindex
        unique (email),
    constraint user_login_uindex
        unique (login)
);

create or replace table token
(
    id        int auto_increment
        primary key,
    id_user   int unsigned                          not null,
    text      varchar(40)                           not null,
    init_date timestamp default current_timestamp() not null,
    constraint token_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create or replace table video
(
    id          int unsigned auto_increment
        primary key,
    title       varchar(100)            not null,
    description longtext     default '' not null,
    url_video   varchar(100) default '' not null,
    url_preview varchar(100)            null,
    rating      int(10)      default 0  not null,
    `like`      int(10)      default 0  not null,
    dislike     int(10)      default 0  not null,
    id_user     int unsigned            not null,
    constraint video_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade
);

create or replace table comment
(
    id       int unsigned auto_increment
        primary key,
    text     longtext default '' not null,
    id_user  int unsigned        not null,
    id_video int unsigned        not null,
    constraint comment_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade,
    constraint comment_video_id_fk
        foreign key (id_video) references video (id)
            on update cascade on delete cascade
);

create or replace table estimate
(
    id       int unsigned auto_increment
        primary key,
    star     smallint(1) unsigned default 0 not null comment '0-Просмотренно, 1-like, 2-unlike',
    id_user  int unsigned                   not null,
    id_video int unsigned                   not null,
    constraint estimate_user_id_fk
        foreign key (id_user) references user (id)
            on update cascade on delete cascade,
    constraint rating_video_id_fk
        foreign key (id_video) references video (id)
            on update cascade on delete cascade
);

DROP TRIGGER IF EXISTS estimate_create;
CREATE TRIGGER estimate_create
    AFTER INSERT
    ON estimate
    FOR EACH ROW
BEGIN
    UPDATE video SET rating = rating + 1 WHERE id = NEW.id_video;
    case when NEW.star = 1 then UPDATE video SET `like` = `like` + 1 WHERE id = NEW.id_video;
        WHEN NEW.star = 2 then UPDATE video SET dislike = dislike + 1 WHERE id = NEW.id_video;
        else begin
        end;
        end case;
end;

DROP TRIGGER IF EXISTS estimate_update;
CREATE TRIGGER estimate_update
    BEFORE UPDATE
    ON estimate
    FOR EACH ROW
BEGIN
    case when OLD.star = 0 then
        case when NEW.star = 1 then UPDATE video SET `like` = `like` + 1 WHERE id = NEW.id_video;
            WHEN NEW.star = 2 then UPDATE video SET dislike = dislike + 1 WHERE id = NEW.id_video;
            else begin
            end;
            end case;
        when OLD.star = 1 then
            case when NEW.star = 1 then begin
                UPDATE video SET `like` = `like` - 1 WHERE id = NEW.id_video;
                SET NEW.star = 0;
            end;
                WHEN NEW.star = 2 then begin
                    UPDATE video SET dislike = dislike + 1 WHERE id = NEW.id_video;
                    UPDATE video SET `like` = `like` - 1 WHERE id = NEW.id_video;
                end; else begin
            end;
                end case;
        when OLD.star = 2 then
            case when NEW.star = 2 then begin
                UPDATE video SET dislike = dislike - 1 WHERE id = NEW.id_video;
                SET NEW.star = 0;
            end;
                WHEN NEW.star = 1 then begin
                    UPDATE video SET dislike = dislike - 1 WHERE id = NEW.id_video;
                    UPDATE video SET `like` = `like` + 1 WHERE id = NEW.id_video;
                end;
                else begin
                end;
                end case; else begin
    end;
        end case;
end;


