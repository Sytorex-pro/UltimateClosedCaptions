
import { z } from "zod";
import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { AccessToken } from "@twurple/auth";
import { randomBytes } from "crypto";
import { promisify } from "node:util";
import { Stats } from "./Stats";

const randBytes = promisify(randomBytes);

@Entity()
export class User extends BaseEntity {
	@ObjectIdColumn()
	id: ObjectId;

	// Relations
	@OneToMany(() => Stats, (stats) => stats.user)
	stats: Stats[];

	// Properties
	@CreateDateColumn()
	created: Date

	@UpdateDateColumn()
	updated: Date

	@Column({unique: true})
	twitchId: string;

	@Column()
	twitchLogin: string;

	@Column('json')
	twitchToken: AccessToken;

	@Column()
	email: string;

	@Column()
	webhookSecret: string;

	@Column('json')
	config: UserConfig = {
		transcribe: '',
		lastSpokenLang: 'fr-FR',
		spokenLang: 'en-US',

		translateService: '',
		translateLangs: [],
		
		twitchAutoStop: true,

		obsEnabled: false,
		obsPort: 4455,
		obsPassword: '',
		obsSendCaptions: true,
		obsAutoStop: true
	};

	@Column()
	twitchConfig: TwitchConfig = {};

	@Column('json')
	secrets: UserSecrets = {};

	// Methods
	async genWebhookSecret() {
		const bytes = await randBytes(32);
		this.webhookSecret = bytes.toString('hex');
		await this.save();
	}
}

export const UserConfigSchema = z.object({
	transcribe: /*z.union([*/
		z.literal(''),/*
		z.literal('azure'),
	]),*/
	lastSpokenLang: z.string(),
	spokenLang: z.string(),
	/*spokenLangs: z.array(z.string()).optional(),*/

	translateService: z.union([
		z.literal(''),
		//z.literal('azure'),
		z.literal('gcp')
	]),
	translateLangs: z.array(z.string()),

	twitchAutoStop: z.boolean(),
	/*
	banWords: z.array(z.object({
		lang: z.string(),
		text: z.string()
	}))*/

	obsEnabled: z.boolean(),
	obsPort: z.number(),
	obsPassword: z.string(),
	obsSendCaptions: z.boolean(),
	obsAutoStop: z.boolean()
});

export type UserConfig = z.infer<typeof UserConfigSchema>;

export const UserSecretsSchema = z.object({
	/*
	// Azure stt config
	azureSttKey: z.string().max(128).optional(),
	azureSttRegion: z.string().max(32).optional(),

	// Azure translation config
	azureKey: z.string().max(128).optional(),
	azureRegion: z.string().max(32).optional(),
	*/

	//GCP translation config
	gcpKey: z.string().max(128).optional(),
});

export type UserSecrets = z.infer<typeof UserSecretsSchema>;

export const TwitchConfigSchema = z.object({
	showCaptions: z.boolean()
}).partial();

export type TwitchConfig = z.infer<typeof TwitchConfigSchema>;